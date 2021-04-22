import { ipcMain, ipcRenderer, remote } from "electron";
import { BehaviorSubject, Subject } from "rxjs";
import { getWindowsByName, hasWindowName } from "src/base/electron-help";
import { randomString } from "src/base/js-help/string";
import { useLocalService } from "src/base/injecter";
import { MAIN_PROCESS } from "src/base/const";

const ID_LENGTH = 5;
/** 远程通信的管道名 */
const REMOTE_CHANNEL = "REMOTE_CHANNEL";
/** 自定义的BehaviorSubject的初始值 */
const CUSTOM_BEHAVIOR_SUBJECTINIT_VALUE = "!@#$%^&*()";

export enum ERemoteCallAction {
  callFn = "call-fn", // 调用函数
  callAttr = "call-attr", // 调用属性 Observable类型的数据
  sendResult = "send-result", // 调用函数 返回结果
  sendData = "send-data", // 调用属性&属性改变 发送数据
}

type TCallFnPayload = {
  serviceName: string;
  key: string;
  params?: any[];
};

type TCallAttrPayload = {
  serviceName: string;
  key: string;
};

type TSendResultPayload = any;

type TSendDataPayload = {
  serviceName: string;
  key: string;
  data: any;
};

type TPayload<T extends ERemoteCallAction> = T extends ERemoteCallAction.callFn
  ? TCallFnPayload
  : T extends ERemoteCallAction.callAttr
  ? TCallAttrPayload
  : T extends ERemoteCallAction.sendResult
  ? TSendResultPayload
  : TSendDataPayload;

export type TRemoteCallData<T extends ERemoteCallAction> = {
  requestId: string;
  target: string;
  source: string;
  action: T;
  payload: TPayload<T>;
};

/** 调用主进程或渲染进程(其他窗口)的服务 */
class RemoteCallService {
  private _remoteServiceMap: Map<
    string,
    { [key: string]: Function | Subject<any> }
  > = new Map();
  private _attrWindowNamesMap: Map<string, string[]> = new Map();
  private _ipc = remote ? ipcRenderer : ipcMain;
  currentWindowName = remote ? remote.getCurrentWindow().title : MAIN_PROCESS;

  constructor() {
    this.onMessage();
  }

  /** 监听主进程或渲染进程(其他窗口)发来的消息 */
  private onMessage() {
    this._ipc.on(
      REMOTE_CHANNEL,
      (_, data: TRemoteCallData<ERemoteCallAction>) => {
        console.info(`RemoteCallService onMessage: `, data);
        this[data.action]?.(data);
      }
    );
  }

  /** 调用本地服务的方法 */
  async [ERemoteCallAction.callFn](
    data: TRemoteCallData<ERemoteCallAction.callFn>
  ) {
    const { requestId, payload, source } = data;
    const { serviceName, key, params = [] } = payload;

    const service = useLocalService(serviceName);
    const result = await service[key]?.(...params);

    this.sendMessage(requestId, source, {
      requestId,
      source: this.currentWindowName,
      target: source,
      action: ERemoteCallAction.sendResult,
      payload: result,
    });
  }

  /** 调用本地服务的rxjs属性 */
  [ERemoteCallAction.callAttr](
    data: TRemoteCallData<ERemoteCallAction.callAttr>
  ) {
    const { payload, source } = data;
    const { serviceName, key } = payload;

    const windowNames = this._attrWindowNamesMap.get(key) || [];
    // 长度为空时将指针设置进map
    if (!windowNames.length) this._attrWindowNamesMap.set(key, windowNames);

    const service = useLocalService(serviceName);
    const subject = service[key] as Subject<any>;

    // 此属性被调用且此窗口名已在列表内
    if (windowNames.length && windowNames.indexOf(source) !== -1) {
      // BehaviorSubject类型需要补偿一次数据
      if (subject instanceof BehaviorSubject) {
        const data = subject.getValue();

        this.sendMessageWrap(source, ERemoteCallAction.sendData, {
          serviceName,
          key,
          data,
        });
      }

      return;
    }

    windowNames.push(source);

    if (windowNames.length === 1) {
      // 数组长度为1时需调用subscribe
      const subscription = subject.subscribe((data) => {
        // 过滤不存在的窗口
        let i = 0;
        while (windowNames[i]) {
          if (hasWindowName(windowNames[i])) i++;
          else windowNames.splice(i, 1);
        }
        // 需要此属性的窗口为空
        if (!windowNames.length) return subscription.unsubscribe();

        for (const windowName of windowNames) {
          this.sendMessageWrap(windowName, ERemoteCallAction.sendData, {
            serviceName,
            key,
            data,
          });
        }
      });
    }
  }

  /** 远程服务属性更新，更新此服务的代理属性 */
  [ERemoteCallAction.sendData](
    data: TRemoteCallData<ERemoteCallAction.sendData>
  ) {
    const { payload, source } = data;
    const { serviceName, key, data: _data } = payload;

    const mapKey = `${source}-${serviceName}`;
    const service = this._remoteServiceMap.get(mapKey);

    (service[key] as Subject<any>)?.next(_data);
  }

  /**
   * 给主进程或渲染进程(其他窗口)发送消息
   * @param channel 通道名
   * @param windowName 窗口名
   * @param data 数据
   */
  sendMessage(
    channel: string,
    windowName: string,
    data: TRemoteCallData<ERemoteCallAction>
  ) {
    // 经过injecter的useService包装 进入到此方法已是调用其他进程或窗口了
    console.info(`RemoteCallService sendMessage: `, data);

    if (windowName === MAIN_PROCESS) {
      ipcRenderer.send(channel, data);
    } else {
      const windows = getWindowsByName(windowName);
      windows.forEach((window) => window.webContents.send(channel, data));
    }
  }

  private sendMessageWrap<T extends ERemoteCallAction>(
    windowName: string,
    action: T,
    payload: TPayload<T>
  ) {
    const requestId = randomString(ID_LENGTH);

    this.sendMessage(REMOTE_CHANNEL, windowName, {
      requestId,
      target: windowName,
      source: this.currentWindowName,
      action,
      payload,
    });
  }

  /** 给主进程或渲染进程(其他窗口)发送消息并得到返回值 */
  private async sendMessageAndReturn<T extends ERemoteCallAction>(
    windowName: string,
    action: T,
    payload: TPayload<T>
  ) {
    const requestId = randomString(ID_LENGTH);
    this.sendMessage(REMOTE_CHANNEL, windowName, {
      requestId,
      target: windowName,
      source: this.currentWindowName,
      action,
      payload,
    });

    const result = await new Promise((res) => {
      this._ipc.once(requestId, (_, data) => {
        console.info(`RemoteCallService onMessage: `, data);
        res(data.payload);
      });
    });

    return result;
  }

  /** 生成代理的服务对象 */
  private createProxyService(serviceName: string, windowName: string) {
    return new Proxy(Object.create(null), {
      get: (obj, key: string) => {
        if (obj[key]) return obj[key];

        if (key[0] === "$") {
          // rxjs数据
          this.sendMessageWrap(windowName, ERemoteCallAction.callAttr, {
            serviceName,
            key,
          });
          obj[key] = new CustomBehaviorSubject(
            CUSTOM_BEHAVIOR_SUBJECTINIT_VALUE
          );
        } else {
          // 执行方法
          obj[key] = async (...params) =>
            await this.sendMessageAndReturn(
              windowName,
              ERemoteCallAction.callFn,
              {
                serviceName,
                key,
                params,
              }
            );
        }

        return obj[key];
      },
    });
  }

  /** 调用主进程或渲染进程(其他窗口)的服务 */
  useRemoteService(serviceName: string, windowName: string) {
    const key = `${windowName}-${serviceName}`;
    const service = this._remoteServiceMap.get(key);
    if (service) return service;

    const proxy = this.createProxyService(serviceName, windowName);
    this._remoteServiceMap.set(key, proxy);

    return proxy;
  }
}

/** 自定义的BehaviorSubject当值是 "!@#$%^&*()" 时不触发subscribe的回调*/
class CustomBehaviorSubject<T> extends BehaviorSubject<T> {
  subscribe(cb) {
    if (cb instanceof Function) {
      const _cb = cb;
      cb = (value) => {
        if (value === CUSTOM_BEHAVIOR_SUBJECTINIT_VALUE) return;
        _cb(value);
      };
    }

    const subscription = super.subscribe(cb);

    // const unsubscribe = subscription.unsubscribe
    // subscription.unsubscribe = function() {
    //   // 发送关闭的广播
    //   const broadcastService = new BroadcastService(CHANNEL_NAME)
    //   broadcastService.sendMessage({})
    //   unsubscribe()
    // }

    return subscription;
  }
}

export default new RemoteCallService();
