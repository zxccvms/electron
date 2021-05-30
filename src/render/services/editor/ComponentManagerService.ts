import { BehaviorSubject } from "rxjs";
import LoggerService from "src/base/js-helper/LoggerService";
import { injectable } from "src/base/service-manager";
import ComponentEntityService from "./ComponentEntityService";

type TComponentEntityServiceMap = {
  [filePath: string]: ComponentEntityService;
};

/** 组件实例服务管理器 */
@injectable("ComponentManagerService")
class ComponentManagerService {
  private _loggerService = new LoggerService("ComponentManagerService");
  $componentEntityServiceMap: BehaviorSubject<TComponentEntityServiceMap> =
    new BehaviorSubject({});

  /** 得到组件实例服务 */
  getComponentEntityService(filePath: string): ComponentEntityService {
    const componentEntityServiceMap =
      this.$componentEntityServiceMap.getValue();
    if (!componentEntityServiceMap[filePath]) {
      this._loggerService.warn(
        "getComponentEntityMap warn: ComponentEntityService is not existed by filePath: ",
        filePath
      );
      return null;
    }

    return componentEntityServiceMap[filePath];
  }

  /** 创建组件实例服务 */
  createComponentEntityService(filePath: string): ComponentEntityService {
    const isExisted = this.getComponentEntityService(filePath);
    if (isExisted) {
      this._loggerService.warn(
        "getComponentEntityMap warn: ComponentEntityService is existed by filePath: ",
        filePath
      );
      return isExisted;
    }

    const componentEntityService = new ComponentEntityService(filePath);

    this._updateComponentEntityServiceMap({
      [filePath]: componentEntityService,
    });

    return componentEntityService;
  }

  /** 移除组件实例服务 */
  removeComponentEntityService(filePath: string) {
    const isExisted = this.getComponentEntityService(filePath);
    if (!isExisted) {
      this._loggerService.warn(
        "removeComponentEntityService warn: ComponentEntityService is not existed by filePath: ",
        filePath
      );
      return;
    }

    const componentEntityServiceMap =
      this.$componentEntityServiceMap.getValue();

    delete componentEntityServiceMap[filePath];

    this.$componentEntityServiceMap.next({
      ...componentEntityServiceMap,
    });
  }

  private _updateComponentEntityServiceMap(
    componentEntityServices: TComponentEntityServiceMap
  ) {
    const componentEntityServiceMap =
      this.$componentEntityServiceMap.getValue();

    this.$componentEntityServiceMap.next({
      ...componentEntityServiceMap,
      ...componentEntityServices,
    });
  }
}

export default ComponentManagerService;
