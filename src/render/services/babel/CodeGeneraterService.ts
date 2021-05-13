import * as types from "@babel/types";
import generator from "@babel/generator";
import { injectable } from "src/base/service-manager";

/** 代码生成器 */
@injectable("CodeGeneraterService")
class CodeGeneraterService {
  /** 将AST转成代码 */
  transformToCode(ast: types.Node): string {
    const output = generator(ast);
    return output.code;
  }
}

export default CodeGeneraterService;
