import { remote, BrowserWindow } from "electron";

export function getWindowsByName(windowName: string): Electron.BrowserWindow[] {
  const windows = (BrowserWindow || remote.BrowserWindow).getAllWindows();

  return windows.filter((window) => window.title === windowName);
}
