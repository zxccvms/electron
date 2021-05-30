import { inject, injectable } from "src/base/service-manager";
import * as types from "@babel/types";
import { NodeResolverService, CodeResolverService } from "src/render/services";
import { TComponentEntityMap } from "src/render/services/editor/type.d";
import LoggerService from "src/base/js-helper/LoggerService";
import { MAIN_CONTAINER } from "src/base/const";
import ComponentEntityService from "src/render/services/editor/ComponentEntityService";

const code = `
const b = <div style={{width: "90px",height: "100px", border: "2px solid #777"}}>
  <span style={{color: "#123",fontSize: "20px"}}>123</span>
  <span style={{color: "#456",fontSize: "30px"}}>456</span>
</div>
`;

/** 语法树解析器 */
@injectable("AstResolverService", {
  isPreposition: true,
})
class AstResolverService {
  @inject("CodeResolverService") codeResolverService: CodeResolverService;
  @inject("NodeResolverService") nodeResolverService: NodeResolverService;
  private _loggerService = new LoggerService("AstResolverService");

  constructor() {
    const file = this.codeResolverService.transformToAst(code);
    this.transformToComponentEntityMap(file);
  }

  /** Ast转组件实例 todo*/
  transformToComponentEntityMap(ast: types.Node): TComponentEntityMap {
    const componentEntityService = new ComponentEntityService("");

    types.traverse(ast, (node, parents) => {
      switch (node.type) {
        case "JSXElement":
          this._traverseJSXElement(node, parents, componentEntityService);
      }
    });

    return componentEntityService.$componentEntityMap.getValue();
  }

  /** 遍历JSXElement节点 */
  private _traverseJSXElement(
    node: types.JSXElement,
    parents: types.TraversalAncestors,
    componentEntityService: ComponentEntityService
  ) {
    const { tag, attrNode, childNode } =
      this.nodeResolverService.resolveJSXElement(node);
    const componentEntity = componentEntityService.createComponentEntity(tag, {
      attrNode,
      loc: node.loc,
      childNode,
    });
    if (!componentEntity) return;

    const lastParent = parents[parents.length - 1];
    const containerId =
      lastParent.node.type === "JSXElement"
        ? componentEntityService.getComponentEntityByLoc(lastParent.node.loc).id
        : MAIN_CONTAINER;

    componentEntityService.insertComponentEntityInContainer(containerId, {
      index: lastParent.index || 0,
      entityId: componentEntity.id,
    });
  }
}

export default AstResolverService;
