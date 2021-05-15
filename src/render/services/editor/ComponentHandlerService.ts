import LoggerService from "src/base/js-helper/LoggerService";
import { injectable } from "src/base/service-manager";
import { TAttrNode } from "./type.d";

@injectable("ComponentHandlerService")
class ComponentHandlerService {
  private _loggerService = new LoggerService("ComponentHandlerService");

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
