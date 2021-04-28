import { remote, BrowserWindow } from "electron";
import { MAIN_PROCESS } from "src/base/const";

export function getWindowsByName(windowName: string): BrowserWindow[] {
  const windows = (BrowserWindow || remote.BrowserWindow).getAllWindows();
  return windows.filter((window) => window.title === windowName);
}

/** 是否存在窗口名 如果windowName === MAIN_PROCESS 表示主进程 */
export function hasWindowName(windowName: string): boolean {
  if (windowName === MAIN_PROCESS) return true;
  else if (getWindowsByName(windowName).length) return true;
  else return false;
}
