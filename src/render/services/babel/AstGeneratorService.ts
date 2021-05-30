import {
  EComponentMode,
  TComponentEntity,
  TComponentEntityMap,
} from "src/render/services/editor/type.d";
import * as types from "@babel/types";
import { inject, injectable } from "src/base/service-manager";
import {
  ComponentHandlerService,
  NodeGeneratorService,
} from "src/render/services";

/** 语法树生成器 */
@injectable("AstGeneratorService")
class AstGeneratorService {
  @inject("NodeGeneratorService") nodeGeneratorService: NodeGeneratorService;
  @inject("ComponentHandlerService")
  componentHandlerService: ComponentHandlerService;

  /** 创建ast */
  createAst(
    componentEntityMap: TComponentEntityMap,
    componentEntity: TComponentEntity
  ): types.JSXElement {
    const { tag, mode, attrNode, childNode } = componentEntity;
    const { styles = [] } = attrNode;

    const attributes = [];
    if (styles.length) {
      const style =
        this.componentHandlerService.stylesAttrItemToStyleProp(styles);
      const styleAttribute = this.nodeGeneratorService.createJSXAttribute(
        "style",
        style
      );
      attributes.push(styleAttribute);
    }

    let children = [];
    if (mode === EComponentMode.content) {
      const jsxText = this.nodeGeneratorService.createJSXText(
        childNode as string
      );
      children.push(jsxText);
    } else if (mode === EComponentMode.container) {
      children = (childNode as string[]).map((childId) => {
        const childEntity = this.componentHandlerService.getComponentEntityById(
          componentEntityMap,
          childId
        );
        return this.createAst(componentEntityMap, childEntity);
      });
    }

    return this.nodeGeneratorService.createJSXElement(
      tag,
      attributes,
      children
    );
  }
}

export default AstGeneratorService;
