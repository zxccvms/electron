import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";
import * as types from "@babel/types";
import { inject, injectable } from "src/base/service-manager";
import CodeGeneraterService from "./CodeGeneraterService";
import { ComponentHandlerService } from "..";

/** 语法树生成器 */
@injectable("ASTGeneraterService")
class ASTGeneraterService {
  @inject("CodeGeneraterService") codeGeneraterService: CodeGeneraterService;
  @inject("ComponentHandlerService")
  componentHandlerService: ComponentHandlerService;

  /** 组件实例转AST */
  transformToAST(
    componentEntity: TComponentEntity<EComponentMode>
  ): types.JSXElement {
    const { tag, mode, attrNode, childNode } = componentEntity;
    const { styles = [], options = [] } = attrNode;

    const attributes = [];
    if (styles.length) {
      const style =
        this.componentHandlerService.stylesAttrItemToStyleProp(styles);
      const styleAttribute = this._createJSXAttribute("style", style);
      attributes.push(styleAttribute);
    }
    if (options.length) {
      // todo
    }

    let children = [];
    if (mode === EComponentMode.content) {
      const jsxText = this._createJSXText(childNode as string);
      children.push(jsxText);
    } else if (mode === EComponentMode.container) {
      // todo
    }

    return this._createJSXElementNode(tag, attributes, children);
  }

  /** 创建JSX节点 */
  private _createJSXElementNode(
    tag: string,
    attributes: (types.JSXAttribute | types.JSXSpreadAttribute)[] = [],
    children: (
      | types.JSXText
      | types.JSXExpressionContainer
      | types.JSXSpreadChild
      | types.JSXElement
      | types.JSXFragment
    )[] = [],
    selfClosing: boolean = false
  ) {
    const jsxIdentifier = this._createJSXIdentifier(tag);

    const openingElement = types.jSXOpeningElement(
      jsxIdentifier,
      attributes,
      selfClosing
    );

    let closingElement = null;
    if (!selfClosing) {
      closingElement = types.jSXClosingElement(jsxIdentifier);
    }

    return types.jsxElement(
      openingElement,
      closingElement,
      children,
      selfClosing
    );
  }

  /** 创建jsx属性 */
  private _createJSXAttribute(name: string, value: any): types.JSXAttribute {
    const jsxIdentifier = this._createJSXIdentifier(name);

    let valueNode = null;
    if (typeof value === "string") {
      valueNode = this._createLiteral(value);
    } else {
      valueNode = this._createJSXExpressionContainer(value);
    }

    return types.jSXAttribute(jsxIdentifier, valueNode);
  }

  /** 创建ReactNode的文本 */
  private _createJSXText(value: string): types.JSXText {
    return types.jSXText(value);
  }

  /** 创建jsx表达式容器 */
  private _createJSXExpressionContainer(
    value: any
  ): types.JSXExpressionContainer {
    const expression = this._createExpression(value);

    return types.jSXExpressionContainer(expression);
  }

  /** 创建表达式 */
  private _createExpression<T extends string | object>(
    value: T
  ): types.Expression {
    let result = null;
    const type = judgeType(value);

    if (type === "Object") {
      result = this._createObjectExpression(value as object);
    } else if (type === "Array") {
      result = this._createArrayExpression(value as Array<any>);
    } else {
      result = this._createLiteral(value as string);
    }

    return result;
  }

  /** 创建对象表达式 */
  private _createObjectExpression(obj: object): types.ObjectExpression {
    const properties = [];

    for (const [key, value] of Object.entries(obj)) {
      const identifier = this._createIdentifier(key);
      let property = null;
      const type = judgeType(value);
      if (type === "Function") {
        // todo 对象方法表达式
      } else {
        let valueNode = null;
        if (type === "Array") {
          valueNode = this._createArrayExpression(value);
        } else if (type === "Object") {
          valueNode = this._createObjectExpression(value);
        } else {
          valueNode = this._createLiteral(value);
        }

        property = types.objectProperty(identifier, valueNode);
      }
      properties.push(property);
    }

    return types.objectExpression(properties);
  }

  /** 创建数组表达式 */
  private _createArrayExpression(array: Array<any>): types.ArrayExpression {
    const elements = array.map((item) => this._createExpression(item));

    return types.arrayExpression(elements);
  }

  /** 创建常规文本 */
  private _createLiteral<T extends string | number | null | RegExp>(
    value: T
  ): types.Literal {
    switch (judgeType(value)) {
      case "String":
        return types.stringLiteral(value as string);
      case "Number":
        return types.numericLiteral(value as number);
      case "RegExp":
        return types.regExpLiteral(
          (value as RegExp).source,
          (value as RegExp).flags
        );
      default:
        return types.nullLiteral();
    }
  }

  /** 创建标识符 */
  private _createIdentifier(name: string): types.Identifier {
    return types.identifier(name);
  }

  /** 创建jsx标识符 */
  private _createJSXIdentifier(name: string): types.JSXIdentifier {
    return types.jSXIdentifier(name);
  }
}

export default ASTGeneraterService;
