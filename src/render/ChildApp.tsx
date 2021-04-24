import React from "react";
import ReactDom from "react-dom";
import { ipcRenderer, remote } from "electron";
import { useService } from "src/base/injecter";
import { WindowService } from "src/render/services";
import { EWindowName } from "src/base/const/type.d";
import { WINDOW_RENDER_CHANNEL_NAME } from "src/render/services/window/WindowService";

import Preview from "src/render/pages/preview";

const pageConfigMap = {
  [EWindowName.Preview]: {
    width: 800,
    height: 800,
    Component: Preview,
  },
};

ipcRenderer.once(
  WINDOW_RENDER_CHANNEL_NAME,
  (_, windowName: EWindowName, props: object, sourceWindowId: number) => {
    const windowService = useService<WindowService>("WindowService");
    const window = windowService.window;
    const { width, height, Component } = pageConfigMap[windowName];

    const sourceWindow = remote.BrowserWindow.fromId(sourceWindowId);
    const handleProps = windowService.propsResolver(sourceWindow, props);

    ReactDom.render(
      <Component {...handleProps} />,
      document.querySelector("#root")
    );

    window.setSize(width, height, true);
    window.setTitle(windowName);
    window.show();
  }
);
