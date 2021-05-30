import LoggerService from "src/base/js-helper/LoggerService";
import { inject } from "src/base/service-manager";
import {
  ComponentModelService,
  ComponentHandlerService,
} from "src/render/services";
import {
  TComponentEntity,
  EComponentMode,
  TEtityPosition,
  TComponentEntityMap,
  TAttrItemPosition,
  TAttrItem,
  TLoc,
} from "./type.d";
import { BehaviorSubject } from "rxjs";
import { MAIN_CONTAINER } from "src/base/const";

/** 组件实例服务 */
class ComponentEntityService {
  @inject("ComponentModelService") componentModelService: ComponentModelService;
  @inject("ComponentHandlerService")
  componentHandlerService!: ComponentHandlerService;

  private _loggerService = new LoggerService("ComponentEntityService");

  /** 组件实例的映射表 */
  $componentEntityMap: BehaviorSubject<TComponentEntityMap> =
    new BehaviorSubject(
      this.componentHandlerService.createComponentEntityMap()
    );
  /** 选择的组件id列表 */
  $selectedIds: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /** 通过id得到实例 */
  getComponentEntityById(id: string): TComponentEntity {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const componentEntity = componentEntityMap[id];

    // if (id === MAIN_CONTAINER && !componentEntity)
    //   return this.createComponentEntity(MAIN_CONTAINER);

    if (!componentEntity) {
      this._loggerService.warn(
        `getComponentEntityById warn: entites is not existed by id{${id}}`
      );
      return null;
    }

    return componentEntity;
  }

  /** 通过loc信息找实例 */
  getComponentEntityByLoc(
    targetLoc: TLoc,
    rootEntityId: string = MAIN_CONTAINER
  ): TComponentEntity {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const componentEntity =
      this.componentHandlerService.getComponentEntityByLoc(
        componentEntityMap,
        targetLoc,
        rootEntityId
      );
    if (!componentEntity) return null;

    return componentEntity;
  }

  /** 创建组件实例 */
  createComponentEntity(
    type: string,
    params: PartialPlus<TComponentEntity> = {}
  ): TComponentEntity {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const componentEntity = this.componentHandlerService.createComponentEntity(
      componentEntityMap,
      type,
      params
    );
    if (!componentEntity) return null;

    if (type !== MAIN_CONTAINER)
      this._updateComponentEntityMap([componentEntity]);
    return componentEntity;
  }

  /** 更新实例 */
  updateComponentEntity(
    id: string,
    params: PartialPlus<TComponentEntity>
  ): TComponentEntity {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const newComponentEntity =
      this.componentHandlerService.updateComponentEntity(
        componentEntityMap,
        id,
        params
      );
    if (!newComponentEntity) return null;

    this._updateComponentEntityMap([newComponentEntity]);
    return newComponentEntity;
  }

  /** 更新实例属性项 */
  updateComponentEntityAttrItem(
    position: TAttrItemPosition,
    params: PartialPlus<TAttrItem>
  ) {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const newComponentEntity =
      this.componentHandlerService.updateComponentEntityAttrItem(
        componentEntityMap,
        position,
        params
      );
    if (!newComponentEntity) return null;

    this._updateComponentEntityMap([newComponentEntity]);
    return newComponentEntity;
  }

  /** 在容器中插入实例 */
  insertComponentEntityInContainer(
    containerId: string,
    entityPosition: TEtityPosition
  ): [TComponentEntity<EComponentMode.container>, TComponentEntity] {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const needUpdateEntities =
      this.componentHandlerService.insertComponentEntityInContainer(
        componentEntityMap,
        containerId,
        entityPosition
      );
    if (!needUpdateEntities) return null;

    this.setSelectedIds([entityPosition.entityId]);
    this._updateComponentEntityMap(needUpdateEntities);

    return needUpdateEntities;
  }

  /** 在容器中移除实例 */
  removeComponentEntityInContainer(
    containerId: string,
    targetId: string
  ): [TComponentEntity<EComponentMode.container>, TComponentEntity] {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const needUpdateEntities =
      this.componentHandlerService.removeComponentEntityInContainer(
        componentEntityMap,
        containerId,
        targetId
      );
    if (!needUpdateEntities) return null;

    this._updateComponentEntityMap(needUpdateEntities);
    return needUpdateEntities;
  }

  /** 删除实例 */
  deleteComponentEntityById(id: string): TComponentEntityMap {
    const componentEntityMap = this.$componentEntityMap.getValue();

    const newComponentEntityMap =
      this.componentHandlerService.deleteComponentEntityById(
        componentEntityMap,
        id
      );
    if (!newComponentEntityMap) return null;

    this.$componentEntityMap.next(newComponentEntityMap);

    return newComponentEntityMap;
  }

  /** 设置选择的组件 */
  setSelectedIds(ids: string[]) {
    this.$selectedIds.next(ids);
  }

  /** 更新的componentEntityMap */
  private _updateComponentEntityMap(componentEntities: TComponentEntity[]) {
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
