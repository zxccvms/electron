import LoggerService from "src/base/js-helper/LoggerService";
import { injectable } from "src/base/service-manager";
import { TAttrNode } from "./type.d";

@injectable("ComponentHandlerService")
class ComponentHandlerService {
  private _loggerService = new LoggerService("ComponentHandlerService");

  stylesAttrItemToStyleProp(styles: TAttrNode["styles"]): React.CSSProperties {
    const styleProp = {};

    for (const { name, value } of styles) {
      styleProp[name] = value;
    }

    return styleProp;
  }
}

export default ComponentHandlerService;
