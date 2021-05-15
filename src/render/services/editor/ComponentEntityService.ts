import LoggerService from "src/base/js-helper/LoggerService";
import { randomString } from "src/base/js-helper/string";
import { inject, injectable } from "src/base/service-manager";
import ComponentModelService from "./ComponentModelService";
import {
  TComponentEntity,
  EComponentMode,
  TEtityPosition,
  TComponentEntityMap,
  TAttrItemPosition,
  TAttrItem,
  TLoc,
} from "./type.d";
import { mergeDeepLeft, clone } from "ramda";
import { BehaviorSubject } from "rxjs";
import { redoOrNext } from "src/base/js-helper/loop";
import { MAIN_CONTAINER } from "src/base/const";
import { PartialPlus } from "src/base/const/type";

const ID_LENGTH = 5;

@injectable("ComponentEntityService")
class ComponentEntityService {
  @inject("ComponentModelService") componentModelService: ComponentModelService;
  private _loggerService = new LoggerService("ComponentEntityService");

  /** 组件实例的映射表 */
  $componentEntityMap: BehaviorSubject<TComponentEntityMap> =
    new BehaviorSubject({
      MAIN_CONTAINER: this.createComponentEntity(
        MAIN_CONTAINER
      ) as TComponentEntity<EComponentMode.container>,
    });
  /** 选择的组件id列表 */
  $selectedIds: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /** 创建组件实例 */
  createComponentEntity(
    type: string,
    params: PartialPlus<TComponentEntity<EComponentMode>> = {}
  ): TComponentEntity<EComponentMode> {
    const componentModelMap =
      this.componentModelService.$componentModelMap.getValue();
    const componentModel = componentModelMap[type];

    if (!componentModel) {
      this._loggerService.error(
        `createComponentEntites error: type {${type}} is not existed`
      );
      return null;
    }

    const id = type === MAIN_CONTAINER ? MAIN_CONTAINER : this._createSoleId();
    const componentEntites: TComponentEntity<EComponentMode> = {
      loc: null,
      ...mergeDeepLeft(params, {
        ...clone(componentModel),
        parentNode: null,
      }),
      id,
    };

    if (type !== MAIN_CONTAINER)
      this._updateComponentEntityMap([componentEntites]);
    return componentEntites;
  }

  /** 更新实例 */
  updateComponentEntity(
    id: string,
    params: PartialPlus<TComponentEntity<EComponentMode>>
  ) {
    const componentEntity = this.getComponentEntityById(id);
    if (!componentEntity) return;

    const newComponentEntity = mergeDeepLeft(params, componentEntity);

    this._updateComponentEntityMap([newComponentEntity]);
  }

  /** 更新实例属性项 */
  updateComponentEntityAttrItem(
    position: TAttrItemPosition,
    params: PartialPlus<TAttrItem<any>>
  ) {
    const { id, key, index } = position;
    const componentEntity = this.getComponentEntityById(id);
    if (!componentEntity) return;

    const attrs = componentEntity.attrNode[key] as TAttrItem<any>[];

    attrs[index] = mergeDeepLeft(params, attrs[index]);

    this.updateComponentEntity(id, {
      attrNode: {
        [key]: [...attrs],
      },
    });
  }

  /** 在容器中插入实例 */
  insertComponentEntityInContainer(
    containerId: string,
    entityPosition: TEtityPosition
  ) {
    const containerEntity = this.getComponentEntityById(
      containerId
    ) as TComponentEntity<EComponentMode.container>;
    if (!containerEntity) return;

    const { index, entityId } = entityPosition;
    const childEntity = this.getComponentEntityById(entityId);
    if (!childEntity) return;

    const newChildNode = [...containerEntity.childNode];
    let originIndex = newChildNode.indexOf(entityId);

    newChildNode.splice(index, 0, entityId);

    if (originIndex !== -1) {
      if (index < originIndex) originIndex += 1;
      newChildNode.splice(originIndex, 1);
    }

    containerEntity.childNode = newChildNode;
    childEntity.parentNode = containerId;

    this.setSelectedIds([entityId]);
    this._updateComponentEntityMap([containerEntity, childEntity]);
  }

  /** 在容器中移除实例 */
  removeComponentEntityInContainer(containerId: string, targetId: string) {
    const containerEntity = this.getComponentEntityById(
      containerId
    ) as TComponentEntity<EComponentMode.container>;
    if (!containerEntity) return;

    const childEntity = this.getComponentEntityById(targetId);
    if (!childEntity) return;

    const newChildNode = [...containerEntity.childNode];
    const index = newChildNode.indexOf(targetId);
    if (index === -1) return;

    newChildNode.splice(index, 1);
    containerEntity.childNode = newChildNode;
    childEntity.parentNode = null;

    this._updateComponentEntityMap([containerEntity, childEntity]);
  }

  /** 通过id得到实例 */
  getComponentEntityById(id: string): TComponentEntity<EComponentMode> {
    const componentEntitesMap = this.$componentEntityMap.getValue();

    const componentEntites = componentEntitesMap[id];

    if (id === MAIN_CONTAINER && !componentEntites)
      return this.createComponentEntity(MAIN_CONTAINER);

    if (!componentEntites) {
      this._loggerService.warn(
        `getComponentEntityById warn: entites is not existed by id{${id}}`
      );
      return null;
    }

    return componentEntites;
  }

  /** 通过loc信息找实例 */
  getComponentEntityByLoc(
    targetLoc: TLoc,
    rootEntityId: string = MAIN_CONTAINER
  ): TComponentEntity<EComponentMode> {
    const rootEntity = this.getComponentEntityById(rootEntityId);
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
        const childEntity = this.getComponentEntityByLoc(targetLoc, childId);
        if (childEntity) return childEntity;
      }
    }

    return null;
  }

  /** 删除实例 */
  deleteComponentEntityById(id: string) {
    const componentEntityMap = this.$componentEntityMap.getValue();
    const componentEntity = componentEntityMap[id];

    if (!componentEntity) {
      this._loggerService.warn(
        `deleteComponentEntityById warn: entites is not existed by id{${id}`
      );
      return;
    }

    const { mode, parentNode } = componentEntity;

    if (mode === EComponentMode.container) {
      const allChildNodes = this.getAllChildNodes(id) || [];

      for (const id of allChildNodes) {
        if (componentEntityMap[id]) delete componentEntityMap[id];
      }
    }

    this.removeComponentEntityInContainer(parentNode, id);

    delete componentEntityMap[id];

    this.$componentEntityMap.next({
      ...componentEntityMap,
    });
  }

  /** 得到容器的所有子节点 */
  getAllChildNodes(id: string): string[] {
    const containerEntity = this.getComponentEntityById(id);
    if (!containerEntity) return null;

    const { mode, childNode } = containerEntity;
    if (mode !== EComponentMode.container) return null;

    const result = [];
    for (const childId of childNode) {
      const allChildNodes = this.getAllChildNodes(childId);
      allChildNodes
        ? result.push(childId, ...allChildNodes)
        : result.push(childId);
    }

    return result;
  }

  /** 设置选择的组件 */
  setSelectedIds(ids: string[]) {
    this.$selectedIds.next(ids);
  }

  /** 创建唯一id */
  private _createSoleId(): string {
    let id = null;
    const componentEntitesMap = this.$componentEntityMap.getValue();

    redoOrNext(() => {
      id = randomString(ID_LENGTH);
      return !componentEntitesMap[id];
    });

    return id;
  }

  /** 更新的componentEntityMap */
  private _updateComponentEntityMap(
    componentEntities: TComponentEntity<EComponentMode>[]
  ) {
    const componentEntityMap = this.$componentEntityMap.getValue();
    const needUpdateEntityMap = {};

    for (const entity of componentEntities) {
      needUpdateEntityMap[entity.id] = { ...entity };
    }

    this.$componentEntityMap.next({
      ...componentEntityMap,
      ...needUpdateEntityMap,
    });
  }
}

export default ComponentEntityService;
