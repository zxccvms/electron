import LoggerService from "src/base/js-helper/LoggerService";
import { randomString } from "src/base/js-helper/string";
import { inject, injectable } from "src/base/service-manager";
import ComponentModelService from "./ComponentModelService";
import { TComponentEntites, EComponentMode } from "./type.d";
import { mergeLeft } from "ramda";
import { BehaviorSubject } from "rxjs";
import { redoOrNext } from "src/base/js-helper/loop";

const ID_LENGTH = 8;

@injectable("ComponentEntitesService")
class ComponentEntitesService {
  @inject("ComponentModelService") componentModelService: ComponentModelService;
  private _loggerService = new LoggerService("ComponentEntitesService");
  /** 组件实例的映射表 */
  $componentEntitesMap: BehaviorSubject<{
    [id: string]: TComponentEntites<EComponentMode>;
  }> = new BehaviorSubject({});
  /** 选择的组件id列表 */
  $selectedIds: BehaviorSubject<string[]> = new BehaviorSubject([]);

  /** 创建组件实例 */
  createComponentEntites(type: string): TComponentEntites<EComponentMode> {
    const componentModelMap = this.componentModelService.$componentModelMap.getValue();
    const componentModel = componentModelMap[type];

    if (!componentModel) {
      this._loggerService.error(
        `createComponentEntites error: type {${type}} is not existed`
      );
      return null;
    }

    const id = this._createSoloId();
    const componentEntites = mergeLeft({ id }, componentModel);
    const componentEntitesMap = this.$componentEntitesMap.getValue();

    const newComponentEntitesMap = {
      ...componentEntitesMap,
      [id]: componentEntites,
    };

    this.$componentEntitesMap.next(newComponentEntitesMap);

    return componentEntites;
  }

  /** 创建唯一id */
  private _createSoloId(): string {
    let id = null;
    const componentEntitesMap = this.$componentEntitesMap.getValue();

    redoOrNext(() => {
      id = randomString(ID_LENGTH);
      return !componentEntitesMap[id];
    });

    return id;
  }

  /** 设置选择的组件 */
  setSelectedIds(ids: string[]) {
    this.$selectedIds.next(ids);
  }
}

export default ComponentEntitesService;
