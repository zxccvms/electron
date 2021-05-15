import { injectable } from "src/base/service-manager";
import * as parser from "@babel/parser";
import * as types from "@babel/types";

/** 代码解析器 */
@injectable("CodeResolverService")
class CodeResolverService {
  /** 代码转ast */
  transformToAST(code: string): types.File {
    return parser.parse(code, {
      sourceFilename: "index.jsx",
      sourceType: "module",
      plugins: ["jsx"],
    });
  }
}

export default CodeResolverService;
