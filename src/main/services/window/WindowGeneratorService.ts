import { BrowserWindow } from "electron";
import { inject, injectable } from "src/base/service-manager";

@injectable("WindowGeneratorService")
class WindowGeneratorService {
  private _prepareWindowId: number = this._createPrepareWindow().id;

  /** 得到预备窗口的id */
  getPrepareWindowId(): number {
    let windowId = this._prepareWindowId;
    if (!BrowserWindow.fromId(windowId)) {
      windowId = this._createPrepareWindow().id;
    }

    this._prepareWindowId = this._createPrepareWindow().id;
    return windowId;
  }

  /** 创建预备的窗口 */
  private _createPrepareWindow(): BrowserWindow {
    const window = new BrowserWindow({
      width: 0,
      height: 0,
      show: false,
      webPreferences: {
        nodeIntegration: true, // 允许渲染进程中使用node模块
        contextIsolation: false,
        enableRemoteModule: true, // 允许渲染进程中使用remote模块
      },
    });

    window.loadURL("http://localhost:8080/child.html");
    window.webContents.openDevTools();

    return window;
  }
}

export default WindowGeneratorService;
