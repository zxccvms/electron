import { injectable } from "src/base/service-manager";
import * as parser from "@babel/parser";
import * as types from "@babel/types";

const code = `
import React from 'react'
import React1 from 'react'

const Demo = props => {
  return <div></div>
}

export default Demo
`;

@injectable("BabelService", {
  isPreposition: true,
})
class BabelService {
  constructor() {
    const fileNode = this.getFileNode();
    const programNode = this.getProgramNode(fileNode);

    const importNodes = this.getImportNodes(programNode.body);
    const ExportDefaultNode = this.getExportDefaultNode(programNode.body);
    const variabelNodes = this.getVariableNodes(programNode.body);
    const functionNodes = this.getFunctionNodes(programNode.body);
  }

  getFileNode(): types.File {
    return parser.parse(code, {
      sourceFilename: "index.jsx",
      sourceType: "module",
      plugins: ["jsx"],
    });
  }

  getProgramNode(fileNode: types.File): types.Program {
    return fileNode.program;
  }

  /** 得到import节点 */
  getImportNodes(statements: types.Statement[]): types.ImportDeclaration[] {
    return statements.filter(
      (node) => node.type === "ImportDeclaration"
    ) as types.ImportDeclaration[];
  }

  /** 得到export default节点 */
  getExportDefaultNode(
    statements: types.Statement[]
  ): types.ExportDefaultDeclaration {
    return statements.find(
      (node) => node.type === "ExportDefaultDeclaration"
    ) as types.ExportDefaultDeclaration;
  }

  /** 得到变量声明节点 */
  getVariableNodes(statements: types.Statement[]): types.VariableDeclaration[] {
    return statements.filter(
      (node) => node.type === "VariableDeclaration"
    ) as types.VariableDeclaration[];
  }

  /** 得到函数声明节点 */
  getFunctionNodes(statements: types.Statement[]): types.FunctionDeclaration[] {
    return statements.filter(
      (node) => node.type === "FunctionDeclaration"
    ) as types.FunctionDeclaration[];
  }

  /** 通过函数节点得到块作用域 */
  getBlockStatementByFunctionNode(
    functionNode: types.FunctionDeclaration
  ): types.BlockStatement {
    return functionNode.body;
  }

  /** 通过得到return节点 */
  getReturnStatement(statements: types.Statement[]): types.ReturnStatement {
    return statements.find(
      (node) => node.type === "ReturnStatement"
    ) as types.ReturnStatement;
  }
}

export default BabelService;
