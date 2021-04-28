import { remote, BrowserWindow, ipcRenderer } from "electron";
import React from "react";
import { inject, injectable, TRemoteService } from "src/base/service-manager";
import { EWindowName } from "src/base/const/type.d";
import { deepTraverse, getValueByChainKey } from "src/base/js-helper/object";
import { MAIN_PROCESS } from "src/base/const";
import { WindowGeneratorService } from "src/main/services";
import { clone } from "ramda";
import { randomString } from "src/base/js-helper/string";

const CHANNEL_NAME_PLACEHOLDER = "CHANNEL_NAME";
const matchChannelNameReg = /\$CHANNEL_NAME\$\{(.*)\}/;
export const WINDOW_RENDER_CHANNEL_NAME = "window-render";
export type TWindowComponent<T> = React.FC<T> & {
  showWindow: (props: T) => Promise<BrowserWindow>;
};

@injectable("WindowService")
class WindowService {
  @inject("WindowGeneratorService", MAIN_PROCESS)
  windowGeneratorService: TRemoteService<WindowGeneratorService>;

  window: BrowserWindow = remote.getCurrentWindow();

  /** 被包裹的组件,使其可以在独立窗口中显示 注：性能比showWindow差 */
  windowWrap<T>(
    Component: React.FC<T>,
    windowName: EWindowName
  ): TWindowComponent<T> {
    (Component as TWindowComponent<T>).showWindow = (props) => {
      const window = this.showWindow(windowName, props);
      return window;
    };

    return Component as TWindowComponent<T>;
  }

  /** 显示独立窗口 */
  async showWindow<T>(windowName: EWindowName, props = {} as T) {
    const windowId = await this.windowGeneratorService.getPrepareWindowId();
    const window = remote.BrowserWindow.fromId(windowId);

    this._sendWindowRender(window, windowName, props);

    return window;
  }

  /** 发送窗口渲染事件 */
  private _sendWindowRender<T>(
    window: BrowserWindow,
    windowName: EWindowName,
    props: T
  ): void {
    const [handleProps, chainKeys] = this._handleProps(window, props);
    const windowId = window.id;

    window.webContents.send(
      WINDOW_RENDER_CHANNEL_NAME,
      windowName,
      handleProps,
      this.window.id
    );

    window.on("closed", () => {
      this._removeAllListeners(windowId, chainKeys);
    });
  }

  /** 处理组件的props参数 把里面的方法 经过事件包装 */
  private _handleProps<T extends { [P in keyof T]: T[P] }>(
    window: BrowserWindow,
    props: T
  ): [T, string[]] {
    const handleProps = clone(props);
    const chainKeys: string[] = [];

    deepTraverse(handleProps, (key, value, chainKey, parent) => {
      if (value instanceof Function) {
        chainKeys.push(key);
        const originFn = getValueByChainKey(props, chainKey) as Function;
        parent[key] = this._functionWrapper(window, chainKey, originFn);
      }
    });

    return [handleProps, chainKeys];
  }

  /** props参数解析器 */
  propsResolver<T extends { [P in keyof T]: T[P] }>(
    targetWindow: BrowserWindow,
    props: T
  ): T {
    deepTraverse(props, (key, value, _, parent) => {
      if (typeof value === "string" && matchChannelNameReg.test(value)) {
        parent[key] = this._fcuntionResolver(targetWindow, value);
      }
    });

    return props;
  }

  /** 函数包装器 */
  private _functionWrapper(
    window: BrowserWindow,
    chainKey: string,
    fn: Function = noop
  ) {
    const channelName = this._getChannelName(window.id, chainKey);
    ipcRenderer.on(channelName, async (_, randomId, ...params) => {
      const result = await fn(...params);
      window.webContents.send(channelName + randomId, result);
    });

    return `\$${CHANNEL_NAME_PLACEHOLDER}\${${channelName}}`;
  }

  /** 函数解析器 */
  private _fcuntionResolver(window: BrowserWindow, value: string) {
    const [_, channelName] = value.match(matchChannelNameReg);

    return async (...params) => {
      const randomId = randomString(5);
      window.webContents.send(channelName, randomId, ...params);

      const result = await new Promise((res) => {
        ipcRenderer.once(channelName + randomId, (_, result) => res(result));
      });

      return result;
    };
  }

  /** 移除props参数中方法的监听事件 */
  private _removeAllListeners(windowId: number, chainKeys: string[]) {
    for (const chainKey of chainKeys) {
      const channelName = this._getChannelName(windowId, chainKey);
      ipcRenderer.removeAllListeners(channelName);
    }
  }

  /** 得到通道名 */
  private _getChannelName(windowId: number, chainKey: string): string {
    return `${windowId}-${chainKey}`;
  }
}

export default WindowService;
