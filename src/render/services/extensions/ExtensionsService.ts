import { injectable, inject, TRemoteService } from "src/base/injecter";
import fs from "fs";
import { MAIN_PROCESS } from "src/base/const";
import { BabelService } from "src/main/services";
import crypto from "crypto"; //用来加密
import zlib from "zlib"; //用来压缩

const salt = "slat";

@injectable("ExtensionsService")
class ExtensionsService {
  @inject("BabelService", MAIN_PROCESS)
  babelService: TRemoteService<BabelService>;

  /** 加载器 */
  async loader(filePath: string) {
    try {
      const content = await this._resolver(filePath);
      const code = await this.babelService.jsxTransform(content);
      this._runCode(code);
    } catch (e) {
      console.error("ExtensionsService loader error: ", e);
    }
  }

  /** 解析器 */
  private async _resolver(filePath: string): Promise<string> {
    const result: string = await new Promise((res, rej) => {
      const password = new Buffer(salt);
      const decryptStream = crypto.createDecipher("aes-256-cbc", password);

      const gzip = zlib.createGunzip(); //解压
      const readStream = fs.createReadStream(filePath);

      let content = "";

      readStream //读取
        .pipe(gzip) //解压
        .pipe(decryptStream) //解密
        .on("data", (chunk) => (content += chunk))
        .on("finish", () => res(content))
        .on("error", (e) => rej(e));
    });

    return result;
  }

  /** 代码包裹func */
  private _codeWrap(code: string): string {
    return `(function(){
      ${code}
    })()`;
  }

  private _require(moduleName) {
    switch (moduleName) {
      case "injecter":
        return require("src/base/injecter");
      case "react":
        return require("react");
      case "react-dom":
        return require("react-dom");
      default:
        return null;
    }
  }

  private _runCode(code: string) {
    try {
      const require = this._require;
      eval(this._codeWrap(code));
    } catch (e) {
      console.error("ExtensionsService runCode error: ", e);
    }
  }
}

export default ExtensionsService;
