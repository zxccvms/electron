import { MAIN_CONTAINER } from "src/base/const";
import LoggerService from "src/base/js-helper/LoggerService";
import { createSoleId } from "src/base/js-helper/string";
import { inject, injectable } from "src/base/service-manager";
import { ComponentModelService } from "src/render/services";
import {
  EComponentMode,
  TAttrItem,
  TAttrItemPosition,
  TAttrNode,
  TComponentEntity,
  TComponentEntityMap,
  TComponentModelMap,
  TEtityPosition,
  TLoc,
} from "./type.d";
import { mergeDeepLeft, clone } from "ramda";

const ID_LENGTH = 5;
@injectable("ComponentHandlerService")
class ComponentHandlerService {
  @inject("ComponentModelService") componentModelService: ComponentModelService;
  private _loggerService = new LoggerService("ComponentHandlerService");

  /** 创建一个空的组件实例映射表(包含MAIN_CONTAINER容器) */
  createComponentEntityMap(): TComponentEntityMap {
    return {
      MAIN_CONTAINER: this.createComponentEntity(
        {},
        MAIN_CONTAINER
      ) as TComponentEntity<EComponentMode.container>,
    };
  }

  /** 通过id得到实例 */
  getComponentEntityById(
    componentEntityMap: TComponentEntityMap,
    id: string
  ): TComponentEntity {
    if (!componentEntityMap.hasOwnProperty(id)) {
      this._loggerService.warn(
        `getComponentEntityById warn: entites is not existed by id{${id}}`
      );
      return null;
    }

    return componentEntityMap[id];
  }

  /** 通过loc信息找实例 */
  getComponentEntityByLoc(
    componentEntityMap: TComponentEntityMap,
    targetLoc: TLoc,
    rootEntityId: string = MAIN_CONTAINER
  ): TComponentEntity {
    const rootEntity = this.getComponentEntityById(
      componentEntityMap,
      rootEntityId
    );
    const { mode, loc: rootLoc, childNode } = rootEntity;
    const { fileName, start, end } = targetLoc;

    if (rootLoc) {
      if (fileName !== rootLoc.fileName) {
        this._loggerService.warn(
          `getComponentEntityByLoc warn: fileName is different, source file's name is ${rootLoc.fileName}, target file's name is ${fileName}`
        );
        return null;
      }

      if (
        start.line < rootLoc.start.line &&
        start.colum < rootLoc.start.colum &&
        end.line > rootLoc.end.line &&
        end.colum > rootLoc.end.colum
      )
        return null;

      if (
        start.line === rootLoc.start.line &&
        start.colum === rootLoc.start.colum &&
        end.line === rootLoc.end.line &&
        end.colum === rootLoc.end.colum
      )
        return rootEntity;
    }

    if (mode === EComponentMode.container) {
      for (const childId of childNode) {
        const childEntity = this.getComponentEntityByLoc(
          componentEntityMap,
          targetLoc,
          childId
        );
        if (childEntity) return childEntity;
      }
    }

    return null;
  }

  /** 创建组件实例 */
  createComponentEntity(
    type: string,
    params: PartialPlus<TComponentEntity> = {}
  ): TComponentEntity {
    const componentModelMap =
      this.componentModelService.$componentModelMap.getValue();
    const componentModel = componentModelMap[type];

    if (!componentModel) {
      this._loggerService.error(
        `createComponentEntity error: type {${type}} is not existed`
      );
      return null;
    }

    const id =
      type === MAIN_CONTAINER
        ? MAIN_CONTAINER
        : createSoleId(ID_LENGTH, (id) => !componentModel.hasOwnProperty(id));

    const componentEntity = {
      loc: null,
      ...mergeDeepLeft(params, {
        ...clone(componentModel),
        parentNode: null,
      }),
      id,
    };

    return componentEntity;
  }

  /** 删除实例 */
  deleteComponentEntityById(
    componentEntityMap: TComponentEntityMap,
    id: string
  ): TComponentEntityMap {
    const componentEntity = this.getComponentEntityById(componentEntityMap, id);
    if (!componentEntity) return null;

    const { mode, parentNode } = componentEntity;
    const needUpdateEntities = this.removeComponentEntityInContainer(
      componentEntityMap,
      parentNode,
      id
    );
    if (!needUpdateEntities) return null;

    if (mode === EComponentMode.container) {
      const allChildNodes = this.getAllChildNodes(componentEntityMap, id) || [];

      for (const id of allChildNodes) {
        if (this.getComponentEntityById(componentEntityMap, id))
          delete componentEntityMap[id];
      }
    }

    delete componentEntityMap[id];
    const containerEntity = needUpdateEntities[0];

    return {
      ...componentEntityMap,
      [containerEntity.id]: containerEntity,
    };
  }

  /** 更新实例 */
  updateComponentEntity(
    componentEntityMap: TComponentEntityMap,
    id: string,
    params: PartialPlus<TComponentEntity>
  ): TComponentEntity {
    const componentEntity = this.getComponentEntityById(componentEntityMap, id);
    if (!componentEntity) return null;

    const newComponentEntity = mergeDeepLeft(params, componentEntity) as any;

    return newComponentEntity;
  }

  /** 更新实例属性项 */
  updateComponentEntityAttrItem(
    componentEntityMap: TComponentEntityMap,
    position: TAttrItemPosition,
    params: PartialPlus<TAttrItem>
  ): TComponentEntity {
    const { id, key, index } = position;
    const componentEntity = this.getComponentEntityById(componentEntityMap, id);
    if (!componentEntity) return null;

    const attrs = componentEntity.attrNode[key] as TAttrItem<any>[];

    attrs[index] = mergeDeepLeft(params, attrs[index]);
    const newComponentEntity = this.updateComponentEntity(
      componentEntityMap,
      id,
      {
        attrNode: {
          [key]: [...attrs],
        },
      }
    );

    return newComponentEntity;
  }

  /** 在容器中插入实例 返回更新的实例列表 */
  insertComponentEntityInContainer(
    componentEntityMap: TComponentEntityMap,
    containerId: string,
    entityPosition: TEtityPosition
  ): [TComponentEntity<EComponentMode.container>, TComponentEntity] {
    const containerEntity = this.getComponentEntityById(
      componentEntityMap,
      containerId
    ) as TComponentEntity<EComponentMode.container>;
    if (!containerEntity) return null;

    const { index, entityId } = entityPosition;
    const childEntity = this.getComponentEntityById(
      componentEntityMap,
      entityId
    );
    if (!childEntity) return null;

    const newChildNode = [...containerEntity.childNode];
    let originIndex = newChildNode.indexOf(entityId);

    newChildNode.splice(index, 0, entityId);

    if (originIndex !== -1) {
      if (index < originIndex) originIndex += 1;
      newChildNode.splice(originIndex, 1);
    }

    containerEntity.childNode = newChildNode;
    childEntity.parentNode = containerId;

    return [containerEntity, childEntity];
  }

  /** 在容器中移除实例 */
  removeComponentEntityInContainer(
    componentEntityMap: TComponentEntityMap,
    containerId: string,
    targetId: string
  ): [TComponentEntity<EComponentMode.container>, TComponentEntity] {
    const containerEntity = this.getComponentEntityById(
      componentEntityMap,
      containerId
    ) as TComponentEntity<EComponentMode.container>;
    if (!containerEntity) return null;

    const childEntity = this.getComponentEntityById(
      componentEntityMap,
      targetId
    );
    if (!childEntity) return null;

    const newChildNode = [...containerEntity.childNode];
    const index = newChildNode.indexOf(targetId);
    if (index === -1) return null;

    newChildNode.splice(index, 1);
    containerEntity.childNode = newChildNode;
    childEntity.parentNode = null;

    return [containerEntity, childEntity];
  }

  /** 得到容器的所有子节点 */
  getAllChildNodes(
    componentEntityMap: TComponentEntityMap,
    id: string
  ): string[] {
    const containerEntity = this.getComponentEntityById(componentEntityMap, id);
    if (!containerEntity) return null;

    const { mode, childNode } = containerEntity;
    if (mode !== EComponentMode.container) return null;

    const result = [];
    for (const childId of childNode) {
      const allChildNodes = this.getAllChildNodes(componentEntityMap, childId);
      allChildNodes
        ? result.push(childId, ...allChildNodes)
        : result.push(childId);
    }

    return result;
  }

  /** 样式属性列表转样式Prop */
  stylesAttrItemToStyleProp(styles: TAttrNode["styles"]): React.CSSProperties {
    const styleProp = {};

    for (const { name, value } of styles) {
      styleProp[name] = value;
    }

    return styleProp;
  }

  /** 样式Prop转样式属性列表 todo */
  stylePropToStylesAttrItem(
    styleProp: React.CSSProperties
  ): TAttrNode["styles"] {
    const styles: TAttrNode["styles"] = [];
    const entries = Object.entries(styleProp) as [
      [keyof React.CSSProperties, any]
    ];

    for (const [name, value] of entries) {
      styles.push({
        name,
        value,
      });
    }

    return styles;
  }
}

export default ComponentHandlerService;
