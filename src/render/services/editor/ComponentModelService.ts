import { BehaviorSubject } from "rxjs";
import LoggerService from "src/base/js-helper/LoggerService";
import { injectable } from "src/base/service-manager";
import componentModels from "./componentModels";
import { EComponentMode, TComponentModel, TComponentModelMap } from "./type.d";

@injectable("ComponentModelService", {
  isPreposition: true,
})
class ComponentModelService {
  private _loggerService = new LoggerService("ComponentModelService");

  /** 组件模型 */
  $componentModelMap: BehaviorSubject<TComponentModelMap> = new BehaviorSubject(
    {}
  );

  constructor() {
    this.registerComponentModels(componentModels);
  }

  /** 组件模型注册 */
  registerComponentModels(componentModels: TComponentModel[]): void {
    const componentModelMap = this.$componentModelMap.getValue();

    for (const componentModel of componentModels) {
      if (componentModelMap[componentModel.type]) {
        this._loggerService.warn(
          `register ${componentModel.type} is existed, componentModel: `,
          componentModel
        );
      }

      componentModelMap[componentModel.type] = componentModel;
    }

    this.$componentModelMap.next({
      ...componentModelMap,
    });
  }
}

export default ComponentModelService;
