import { capitalizeTheFirstLetter } from "src/base/js-help/string";
import remoteCallService from "src/base/electron-help/RemoteCallService";
import { Subject } from "rxjs";

type TFilter<U, T> = {
  [P in keyof U]: U[P] extends T ? P : never;
}[keyof U];

export type TRemoteService<T> = {
  [P in TFilter<T, Function | Subject<any>>]: T[P] extends Function
    ? (...args: Parameters<T[P]>) => Promise<ReturnType<T[P]>>
    : T[P];
};

const currentWindowName = remoteCallService.currentWindowName;

/**服务实例映射表 */
const entitesMap = new Map();
/**服务映射表 */
const ServiceMap = new Map();

/**
 * 服务实例化
 * @param serviceName 服务名
 */
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

/**
 * 得到服务实例
 * @param serviceName 服务名
 */
function getLocalEntites(serviceName: string) {
  let entites = entitesMap.get(serviceName);

  if (!entites) entites = instantiation(serviceName);

  return entites;
}

/**
 * 使用本地服务
 * @param serviceName 服务名
 */
export function useLocalService<T>(serviceName: string): T {
  const entites = getLocalEntites(serviceName);
  return entites;
}

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
 * @param serviceName 服务名
 * @param windowName 窗口名
 */
export function useService<T>(
  serviceName: string,
  windowName: string = currentWindowName
): T | TRemoteService<T> {
  if (currentWindowName === windowName) {
    return useLocalService(serviceName);
  } else {
    return useRemoteService(serviceName, windowName);
  }
}

/**
 * 可注入的服务
 * @param serviceName 服务名
 */
export function injectable(serviceName: string = "") {
  return (Service) => {
    ServiceMap.set(serviceName || Service.name, Service);
  };
}

/**
 * 代理注入方法
 * 注：依赖的服务请在_construction中使用
 * 注：相互依赖、先实例化的服务的construction中请异步使用依赖的服务
 */
export function inject(
  serviceName: string = "",
  windowName: string = currentWindowName
) {
  return (_, attrName: string, descriptor?) => {
    serviceName = serviceName || capitalizeTheFirstLetter(attrName);

    descriptor.initializer = function () {
      return new Proxy(Object.create(null), {
        get(_, key) {
          const injectEntites = useService(serviceName, windowName);

          return injectEntites[key];
        },
      });
    };

    return descriptor;
  };
}
