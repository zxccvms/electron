import "./style/index.less";

import { ipcRenderer, remote } from "electron";
import { EWindowName } from "src/base/const/type";
import { WINDOW_RENDER_CHANNEL_NAME } from "src/base/const";

ipcRenderer.once(
  WINDOW_RENDER_CHANNEL_NAME,
  (_, windowName: EWindowName, props: object, sourceWindowId: number) => {
    // 提前设置窗口名
    const window = remote.getCurrentWindow();
    window.setTitle(windowName);

    const render = require("src/render/ChildApp");
    render(windowName, props, sourceWindowId);
  }
);
