import React, { Suspense } from "react";
import { useService } from "src/base/service-manager";

function wrapPromise(promise) {
  let status = "pending";
  let result;
  let suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
}

// export function useAsyncService<T>(serviceName: string): T {
//   const service = new Promise((resolve) => {
//     resolve(useService(serviceName));
//   });

//   const handlePromise = wrapPromise(service);

//   const proxy = new Proxy(service, {
//     get: (_, key) => {
//       const service = handlePromise.read();
//       return service[key];
//     },
//   });

//   return proxy;
// }

// export const asyncWrap = (Component: React.FC) => {
//   return (props) => (
//     <Suspense fallback="">
//       <Component {...props} />
//     </Suspense>
//   );
// };

export function asyncWrapper(
  factory: () => Promise<{
    default: React.ComponentType<any>;
  }>
): React.FC {
  const Component = React.lazy(factory);

  return (props) => (
    <Suspense fallback="">
      <Component {...props} />
    </Suspense>
  );
}
