declare module "*.css";
declare module "*.less";
declare module "*.png";
declare module "*.js";
declare module "*.jsx";
declare module "*.tsx";
declare module "*.ts";
declare const TEST_VALUE: string;
/** 空对象 内部没有任务属性和方法 */
declare const empty: {};
/** 空函数 */
declare const noop: Function;
/** 类型判断 返回首字母大写的类型名 */
declare const judgeType: (target: any) => string;
/** 日志打印器 */
declare const loggerService: {
  log: (...content: any[]) => void;
  error: (...content: any[]) => void;
  warn: (...content: any[]) => void;
  info: (...content: any[]) => void;
};
