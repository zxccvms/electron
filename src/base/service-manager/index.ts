import { capitalizeTheFirstLetter } from "src/base/js-helper/string";
import remoteCallService from "src/base/electron-helper/RemoteCallService";
import { Subject } from "rxjs";
import { MAIN_PROCESS } from "src/base/const";
import { Filter } from "src/base/const/type.d";

const currentWindowName = remoteCallService.currentWindowName;

/** 本地服务实例映射表 */
const entitesMap = new Map();
/** 本地服务实例代理映射表 在使用时才生成实例 优化加载性能*/
const entitesProxyMap = new Map();
/** 本地服务映射表 */
const ServiceMap = new Map();

// 在渲染进程的window对象上挂载useService方法 服务实例
if (currentWindowName !== MAIN_PROCESS) {
  window.__useService = useLocalService;
  window.entitesMap = entitesMap;
}

/** 服务实例化 */
function instantiation(serviceName: string) {
  console.info("instantiation ", serviceName);

  const Service = ServiceMap.get(serviceName);
  if (!Service) {
    console.error(`instantiation error: ${serviceName} is not existed`);
    return null;
  }

  const service = new Service();
  entitesMap.set(serviceName, service);

  // 实例化后执行自定义的_constructor代替constructor
  // 依赖的服务请在此方法中使用
  service._constructor?.();

  return service;
}

function getEntites(serviceName: string) {
  let entites = entitesMap.get(serviceName);
  if (!entites) entites = instantiation(serviceName);

  return entites;
}

/** 创建服务实例代理 */
function createEntitesProxy(serviceName: string) {
  const proxy = new Proxy(empty, {
    get: (_, key) => {
      const entites = getEntites(serviceName);
      const result = entites[key];
      // 函数this指向更改
      if (result instanceof Function) return result.bind(entites);
      return result;
    },
  });

  entitesProxyMap.set(serviceName, proxy);

  return proxy;
}

/**
 * 得到服务实例的代理
 * @param serviceName 服务名
 */
function getEntitesProxy(serviceName: string) {
  let entitiesProxy = entitesProxyMap.get(serviceName);
  if (!entitiesProxy) entitiesProxy = createEntitesProxy(serviceName);

  return entitiesProxy;
}

/**
 * 使用本地服务
 * @param serviceName 服务名
 */
export function useLocalService<T>(serviceName: string): T {
  const entities = getEntites(serviceName);
  return entities;
}

/**
 * 使用本地服务代理
 * 注：用于性能优化 本地初始化时生成代理对象 在使用时在生成实例
 * @param serviceName 服务名
 */
export function useLocalProxyService<T>(serviceName: string): T {
  const entitiesProxy = getEntitesProxy(serviceName);
  return entitiesProxy;
}

export type TRemoteService<T> = {
  [P in Filter<T, Function | Subject<any>>]: T[P] extends Function
    ? (...args: Parameters<T[P]>) => Promise<ReturnType<T[P]>>
    : T[P];
};

/**
 * 使用远程服务
 * @param serviceName 服务名
 * @param windowName 窗口名
 */
export function useRemoteService<T>(
  serviceName: string,
  windowName: string = currentWindowName
): TRemoteService<T> {
  return remoteCallService.useRemoteService(serviceName, windowName);
}

/**
 * 使用单例服务
 * 注：useLocalProxy === true 用于性能优化 本地初始化时生成代理对象 在使用时在生成实例
 * @param serviceName 服务名
 * @param windowName 窗口名
 * @param useLocalProxy 是否使用本地代理
 */
export function useService<T>(
  serviceName: string,
  windowName: string = currentWindowName,
  useLocalProxy: boolean = true
): T {
  if (currentWindowName !== windowName) {
    return useRemoteService<T>(serviceName, windowName) as T;
  } else if (useLocalProxy) {
    return useLocalProxyService(serviceName);
  } else {
    return useLocalService(serviceName);
  }
}

/**
 * 可注入的服务
 * @param serviceName 服务名
 */
export function injectable(serviceName: string) {
  return (Service) => {
    ServiceMap.set(serviceName, Service);
  };
}

/**
 * 代理注入方法
 * 注：依赖的服务请在_construction中使用
 * 注：相互依赖、先实例化的服务的construction中请异步使用依赖的服务
 * 注：useLocalProxy === true 用于性能优化 本地初始化时生成代理对象 在使用时在生成实例
 * @param serviceName 服务名
 * @param windowName 窗口名
 * @param useLocalProxy 是否使用本地代理
 */
export function inject(
  serviceName: string = "",
  windowName: string = currentWindowName,
  useLocalProxy: boolean = true
) {
  return (_, attrName: string, descriptor?) => {
    serviceName = serviceName || capitalizeTheFirstLetter(attrName);

    descriptor.initializer = () =>
      useService(serviceName, windowName, useLocalProxy);

    return descriptor;
  };
}

interface IUseAction {
  action: string;
  params?: any[];
  windowName?: string;
}

const matchActionReg = /^(.+)\/(.+)$/;

/**
 * 通过命令形式调用某个服务的方法
 * @param {string} action 动作名 格式: "WindowService/showWindow"
 */
export function useAction({
  action = "",
  params = [],
  windowName = currentWindowName,
}: IUseAction): any {
  if (!matchActionReg.test(action))
    throw new Error(`useAction action格式错误: ${action}`);
  if (!Array.isArray(params))
    throw new Error(`useAction ${action} params格式错误: 不是一个数组`);

  const [_, serviceName, fnName] = action.match(matchActionReg);
  const service = useService(serviceName, windowName, false);

  if (!service)
    throw new Error(
      `useAction action的服务名错误 不存在此服务名: ${serviceName}`
    );
  if (!(service[fnName] instanceof Function))
    throw new Error(`useAction action的方法名错误: ${fnName}`);

  return service[fnName](...params);
}
