import { connector } from "src/base/const";

/** 深度遍历对象和数组 */
export function deepTraverse(
  target: object | Array<any>,
  cb: (
    key: string,
    value: any,
    chainKey: string,
    parent: object | Array<any>
  ) => boolean | void,
  parentKey: string = ""
): void {
  const type = Object.prototype.toString.call(target);
  if (!(type === "[object Object]" || type === "[object Array]")) return;

  for (const [key, value] of Object.entries(target)) {
    const chainKey = parentKey ? parentKey + connector + key : key;
    const next = cb(key, value, chainKey, target);
    if (next === false) continue;

    const type = Object.prototype.toString.call(target);
    if (type === "[object Object]" || type === "[object Array]") {
      deepTraverse(value, cb, chainKey);
    }
  }
}

/** 根据链条键得到值 */
export function getValueByChainKey(
  target: object | Array<any>,
  chainKey: string
): any {
  const keys = chainKey.split(connector);

  return keys.reduce((pre, key) => pre[key], target);
}

/** 根据链条键设置值 */
export function setValueByChainKey(
  target: object | Array<any>,
  chainKey: string,
  value: any
): any {
  const keys = chainKey.split(connector);
  const selfKey = keys.pop();
  const parent = keys.reduce((pre, key) => pre[key], target);

  parent[selfKey] = value;
}

/** 监听包装器 */
export function listenWrapper(object: object, onChange: Function) {
  const handler = {
    get(target, property, receiver) {
      try {
        return new Proxy(target[property], handler);
      } catch (err) {
        return Reflect.get(target, property, receiver);
      }
    },
    defineProperty(target, property, descriptor) {
      onChange();
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      onChange();
      return Reflect.deleteProperty(target, property);
    },
  };

  return new Proxy(object, handler);
}
