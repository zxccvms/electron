/** 过滤类型 */
export type Filter<U, T> = {
  [P in keyof U]: U[P] extends T ? P : never;
}[keyof U];

export enum EWindowName {
  Main = "Main",
  Preview = "Preview",
}

/** Partial的升级版 递归所有结构 */
export type PartialPlus<T> = {
  [P in keyof Partial<T>]: PartialPlus<T[P]>;
};
