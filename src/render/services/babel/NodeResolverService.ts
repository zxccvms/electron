import { inject, injectable } from "src/base/service-manager";
import * as types from "@babel/types";
import { ComponentHandlerService } from "src/render/services";
import { TAttrNode } from "src/render/services/editor/type.d";
import LoggerService from "src/base/js-helper/LoggerService";

/** 节点解析器 */
@injectable("NodeResolverService")
class NodeResolverService {
  @inject("ComponentHandlerService")
  componentHandlerService: ComponentHandlerService;
  private _loggerService = new LoggerService("NodeResolverService");

  /** 解析jsx节点 */
  resolveJSXElement(node: types.JSXElement): {
    tag: string;
    attrNode: TAttrNode;
    childNode: string | string[];
  } {
    const { openingElement, children } = node;
    const { tag, attrNode } = this._resolveJSXOpeningElement(openingElement);

    let childNode: string | string[] = "";
    // todo 解析children节点 未完善 与设计的component.mode违背 待重构
    for (const child of children) {
      if (child.type === "JSXText") childNode += child.value;
      else {
        childNode = [];
        break;
      }
    }

    return {
      tag,
      attrNode,
      childNode,
    };
  }

  /** 解析JSXOpeningElement */
  private _resolveJSXOpeningElement(node: types.JSXOpeningElement): {
    tag: string;
    attrNode: TAttrNode;
  } {
    const { name, attributes } = node;

    let tag = "";
    switch (name.type) {
      case "JSXMemberExpression":
      case "JSXNamespacedName": {
        this._loggerService.warn(
          `_resolveJSXOpeningElement warn: name's type is ${name.type}`
        );
        return null;
      }
      case "JSXIdentifier":
        tag = this._resolveIdentifier(name);
    }

    let attrNode: TAttrNode = {};
    for (const attribute of attributes) {
      if (attribute.type === "JSXAttribute") {
        let { key, value } = this._resolveJSXAttribute(attribute);

        if (key === "style") {
          attrNode.styles =
            this.componentHandlerService.stylePropToStylesAttrItem(value);
        } else {
          attrNode[key] = value;
        }
      } else {
        // todo 解析JSXSpreadAttribute节点
        return null;
      }
    }

    return {
      tag,
      attrNode,
    };
  }

  /** 解析jsx属性节点 */
  private _resolveJSXAttribute(node: types.JSXAttribute): {
    key: string;
    value: any;
  } {
    const { name, value: valueNode } = node;

    if (name.type === "JSXNamespacedName") {
      this._loggerService.warn(
        `_resolveJSXAttribute warn: name's type is ${name.type}`
      );
      return null;
    }
    const key = this._resolveIdentifier(name);

    let value = null;
    switch (valueNode.type) {
      case "JSXElement":
      case "JSXFragment": {
        this._loggerService.warn(
          `_resolveJSXAttribute warn: value's type is ${valueNode.type}`
        );
        return null;
      }
      case "StringLiteral": {
        value = this._resolveLiteral(valueNode);
        break;
      }
      case "JSXExpressionContainer": {
        if (valueNode.expression.type === "JSXEmptyExpression") {
          this._loggerService.warn(
            `_resolveJSXAttribute warn: value.expression.type is ${valueNode.expression.type}`
          );
          return null;
        }
        value = this._resolveExpression(valueNode.expression);
        break;
      }
    }

    return { key, value };
  }

  /** 解析表达式 */
  private _resolveExpression(node: types.Expression): any {
    switch (node.type) {
      case "ArrayExpression":
        return this._resolveArrayExpression(node);
      case "ObjectExpression":
        return this._resolveObjectExpression(node);
      case "Identifier":
        return this._resolveIdentifier(node);
      case "NullLiteral":
      case "StringLiteral":
      case "NumericLiteral":
      case "BooleanLiteral":
      case "RegExpLiteral":
        return this._resolveLiteral(node);
      default: {
        this._loggerService.warn(
          `_resolveExpression warn: node's type is ${node.type}`
        );
        return null;
      }
    }
  }

  /** 解析数组表达式 */
  private _resolveArrayExpression(node: types.ArrayExpression): any[] {
    return node.elements.map((node) => {
      if (node.type === "SpreadElement") {
        //todo 解析SpreadElement节点
        return null;
      }
      return this._resolveExpression(node);
    });
  }

  /** 解析对象表达式 */
  private _resolveObjectExpression(node: types.ObjectExpression): object {
    const object = {};

    for (const property of node.properties)
      switch (property.type) {
        case "ObjectProperty": {
          const keyName = this._resolveExpression(property.key);
          // todo 解析PatternLike节点
          switch (property.value.type) {
            case "ArrayPattern":
            case "AssignmentPattern":
            case "RestElement":
            case "ObjectPattern": {
              this._loggerService.warn(
                `_resolveObjectExpression warn: property.type is ${property.type}`
              );
              return null;
            }
          }
          const value = this._resolveExpression(property.value);
          object[keyName] = value;
          break;
        }
        case "ObjectMethod":
          continue; // todo
        case "SpreadElement":
          continue; // todo
      }

    return object;
  }

  /** 解析文本 */
  private _resolveLiteral(node: types.Literal) {
    switch (node.type) {
      case "TemplateLiteral":
        return null; // todo
      case "RegExpLiteral":
        return null; // todo
      case "NullLiteral":
        return null;
      default:
        return node.value;
    }
  }

  /** 解析标识符 */
  private _resolveIdentifier(
    node: types.Identifier | types.JSXIdentifier
  ): string {
    return node.name;
  }
}

export default NodeResolverService;
