// import { remote } from 'electron';
import { capitalizeTheFirstLetter } from "src/render/utils/js-help/string";

// const currentWindow = remote.getCurrentWindow();

/**服务实例映射表 */
const entitesMap = new Map();
/**服务映射表 */
const ServiceMap = new Map();

/**
 * 服务实例化
 * @param serviceName 服务名
 */
function instantiation(serviceName) {
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
export function useLocalService(serviceName: string) {
  const entites = getLocalEntites(serviceName);
  return entites;
}

/**
 * 使用远程服务
 * @param serviceName 服务名
 * @param windowName 窗口名
 */
export function useRemoteService(
  serviceName: string,
  windowName: string = "main"
) {
  // todo
}

/**
 * 使用单例服务
 * @param serviceName 服务名
 * @param windowName 窗口名
 */
export function useService(serviceName: string, windowName: string = "main") {
  // if (currentWindow.title === windowName) {
  return useLocalService(serviceName);
  // }
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
export function inject(target: string = "") {
  return (_, attrName: string, descriptor?) => {
    const injectServiceName = capitalizeTheFirstLetter(attrName);

    descriptor.initializer = function () {
      return new Proxy(Object.create(null), {
        get(_, key) {
          const injectEntites = useService(target ? target : injectServiceName);
          return injectEntites[key];
        },
      });
    };

    return descriptor;
  };
}
