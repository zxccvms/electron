/** 日志打印器 */
class LoggerService {
  private _prefix: string = "";

  /** @param {string} prefix 前缀信息 */
  constructor(prefix: string) {
    this._prefix = prefix;
  }

  log(...content: any[]) {
    console.log(this._prefix, ...content);
  }
  info(...content: any[]) {
    console.info(this._prefix, ...content);
  }
  error(...content: any[]) {
    console.error(this._prefix, ...content);
  }
  warn(...content: any[]) {
    console.warn(this._prefix, ...content);
  }
}

export default LoggerService;
