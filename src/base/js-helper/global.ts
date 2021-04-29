import LoggerService from "src/base/js-helper/LoggerService";
// webpack provide plugin 全局导入以下对象 可直接调用

/** 空对象 内部没有任务属性和方法 */
export const empty = Object.create(null);
/** 空函数 */
export const noop = () => {};
/** 日志打印器 */
export const loggerService = new LoggerService("");
