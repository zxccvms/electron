import { Subject } from "rxjs";

export const MAIN_PROCESS = "MAIN_PROCESS";

type TFilter<U, T> = {
  [P in keyof U]: U[P] extends T ? P : never;
}[keyof U];

export type TRemoteService<T> = {
  [P in TFilter<T, Function | Subject<any>>]: T[P] extends Function
    ? (...args: Parameters<T[P]>) => Promise<ReturnType<T[P]>>
    : T[P];
};
