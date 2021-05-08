import LoggerService from "src/base/js-helper/LoggerService";
import { randomString } from "src/base/js-helper/string";
import { inject, injectable } from "src/base/service-manager";
import ComponentModelService from "./ComponentModelService";
import {
  TComponentEntity,
  EComponentMode,
  TEtityPosition,
  TComponentEntityMap,
} from "./type";
import { mergeDeepLeft, clone } from "ramda";
import { BehaviorSubject } from "rxjs";
import { redoOrNext } from "src/base/js-helper/loop";
import { MAIN_CONTAINER } from "src/base/const";

const ID_LENGTH = 5;

@injectable("ComponentEntityService")
class ComponentEntityService {
  @inject("ComponentModelService") componentModelService: ComponentModelService;
  private _loggerService = new LoggerService("ComponentEntityService");

  /** 组件实例的映射表 */
  $componentEntityMap: BehaviorSubject<TComponentEntityMap> = new BehaviorSubject(
    {}
  );
  /** 选择的组件id列表 */
  $selectedIds: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /** 创建组件实例 */
  createComponentEntity(type: string): TComponentEntity<EComponentMode> {
    const componentModelMap = this.componentModelService.$componentModelMap.getValue();
    const componentModel = componentModelMap[type];

    if (!componentModel) {
      this._loggerService.error(
        `createComponentEntites error: type {${type}} is not existed`
      );
      return null;
    }

    const id = type === MAIN_CONTAINER ? MAIN_CONTAINER : this._createSoleId();
    const componentEntites = {
      ...clone(componentModel),
      id,
    };

    this._updateComponentEntityMap([componentEntites]);
    return componentEntites;
  }

  /** 更新实例 */
  updateComponentEntity(id: string, params: any) {
    const componentEntity = this.getComponentEntityById(id);
    if (!componentEntity) return;

    const newComponentEntity = mergeDeepLeft(componentEntity, params);

    this._updateComponentEntityMap([newComponentEntity]);
  }

  /** 在容器中插入实例 */
  insertComponentEntity(containerId: string, entityPosition: TEtityPosition) {
    const containerEntity = this.getComponentEntityById(
      containerId
    ) as TComponentEntity<EComponentMode.container>;
    if (!containerEntity) return;

    const { index, entityId } = entityPosition;
    const newChildNode = [...containerEntity.childNode];
    let originIndex = newChildNode.indexOf(entityId);

    newChildNode.splice(index, 0, entityId);

    if (originIndex !== -1) {
      if (index < originIndex) originIndex += 1;
      newChildNode.splice(originIndex, 1);
    }

    containerEntity.childNode = newChildNode;

    this._updateComponentEntityMap([containerEntity]);
  }

  /** 在容器中移除实例 */
  removeComponentEntity(containerId: string, targetId: string) {
    const containerEntity = this.getComponentEntityById(
      containerId
    ) as TComponentEntity<EComponentMode.container>;
    if (!containerEntity) return;

    const newChildNode = [...containerEntity.childNode];
    const index = newChildNode.indexOf(targetId);
    if (index === -1) return;

    newChildNode.splice(index, 1);
    containerEntity.childNode = newChildNode;

    this._updateComponentEntityMap([containerEntity]);
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
