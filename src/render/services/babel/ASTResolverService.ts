import { inject, injectable } from "src/base/service-manager";
import * as types from "@babel/types";
import {
  NodeResolverService,
  CodeResolverService,
  ComponentEntityService,
} from "src/render/services";
import { TComponentEntityMap } from "src/render/services/editor/type.d";
import LoggerService from "src/base/js-helper/LoggerService";
import { MAIN_CONTAINER } from "src/base/const";

const code = `
const b = <div style={{width: "90px",height: "100px", border: "2px solid #777"}}>
  <span style={{color: "#123",fontSize: "20px"}}>123</span>
  <span style={{color: "#456",fontSize: "30px"}}>456</span>
</div>
`;

/** 语法树解析器 */
@injectable("ASTResolverService", {
  isPreposition: true,
})
class ASTResolverService {
  @inject("ComponentEntityService")
  componentEntityService: ComponentEntityService;
  @inject("CodeResolverService") codeResolverService: CodeResolverService;
  @inject("NodeResolverService") nodeResolverService: NodeResolverService;
  private _loggerService = new LoggerService("ASTResolverService");

  constructor() {
    const file = this.codeResolverService.transformToAST(code);
    this.transformToComponentEntityMap(file);
  }

  /** AST转组件实例 todo*/
  transformToComponentEntityMap(ast: types.Node): TComponentEntityMap {
    types.traverse(ast, (node, parents) => {
      switch (node.type) {
        case "JSXElement":
          this._traverseJSXElement(node, parents);
      }
    });

    return null;
  }

  /** 遍历JSXElement节点 */
  private _traverseJSXElement(
    node: types.JSXElement,
    parents: types.TraversalAncestors
  ) {
    console.log(
      "taozhizhu ~🚀 file: ASTResolverService.ts ~🚀 line 55 ~🚀 ASTResolverService ~🚀 _resolver ~🚀 parents",
      JSON.parse(JSON.stringify(parents))
    );
    const { tag, attrNode, childNode } =
      this.nodeResolverService.resolveJSXElement(node);
    // =======demo=======
    const { id } = this.componentEntityService.createComponentEntity(tag, {
      attrNode,
      loc: node.loc,
      childNode,
    });

    const lastParent = parents[parents.length - 1];
    const containerId =
      lastParent.node.type === "JSXElement"
        ? this.componentEntityService.getComponentEntityByLoc(
            lastParent.node.loc
          ).id
        : MAIN_CONTAINER;

    this.componentEntityService.insertComponentEntityInContainer(containerId, {
      index: lastParent.index || 0,
      entityId: id,
    });
    // =======demo=======
  }
}

export default ASTResolverService;
