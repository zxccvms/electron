import { remote, app, BrowserWindow } from "electron";
import { BehaviorSubject } from "rxjs";
import { heavyArray } from "src/base/js-help/array";
import { MAIN_PROCESS } from "src/base/const";

class WindowsService {
  /** 不包含主进程 */
  $windows: BehaviorSubject<BrowserWindow[]>;
  /** 去重 & 包含主进程名: MAIN_PROCESS */
  $windowNames: BehaviorSubject<string[]> = new BehaviorSubject([MAIN_PROCESS]);
  private _app: Electron.App = app || remote.app;

  constructor() {
    this._init();
    this._onCreateWindow();
    this._onWindowsChange();
  }

  private _init() {
    const windows = (BrowserWindow || remote.BrowserWindow).getAllWindows();
    this.$windows = new BehaviorSubject(windows);
    windows.forEach((window) => this._onCloseWindow(window));
  }

  private _onCreateWindow() {
    this._app.on("browser-window-created", (_, browserWindow) => {
      this._onCloseWindow(browserWindow);

      const windows = this.$windows.getValue();
      this.$windows.next([...windows, browserWindow]);
    });
  }

  private _onCloseWindow(browserWindow: BrowserWindow) {
    browserWindow.on("close", () => {
      const windows = this.$windows.getValue();
      const index = windows.findIndex((window) => window === browserWindow);
      windows.splice(index, 1);
      this.$windows.next([...windows]);
    });
  }

  private _onWindowsChange() {
    this.$windows.subscribe((windows) => {
      this.$windowNames.next([
        MAIN_PROCESS,
        ...heavyArray(windows.map((window) => window.title)),
      ]);
    });
  }

  /** 是否存在此窗口名 */
  hasWindowName(windowName: string): boolean {
    const windowNames = this.$windowNames.getValue();
    return windowNames.indexOf(windowName) !== -1;
  }
}

export default new WindowsService();
