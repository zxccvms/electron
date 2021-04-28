import { injectable } from "src/base/service-manager";
import { transformSync } from "@babel/core";

@injectable("BabelService")
class BabelService {
  transform(code: string, options: Object = {}): string {
    return transformSync(code, options).code;
  }

  /** jsx转化器 */
  jsxTransform(code: string) {
    return this.transform(code, {
      presets: ["@babel/preset-react"],
    });
  }
}

export default BabelService;
