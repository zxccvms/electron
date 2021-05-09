export type Filter<U, T> = {
  [P in keyof U]: U[P] extends T ? P : never;
}[keyof U];

export enum EWindowName {
  Main = "Main",
  Preview = "Preview",
}
