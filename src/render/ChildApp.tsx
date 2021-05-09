import "./services/index";
import React from "react";
import ReactDom from "react-dom";
import { remote } from "electron";
import { useService } from "src/base/service-manager";
import { WindowService } from "src/render/services";
import { EWindowName } from "src/base/const/type.d";
import { asyncWrapper } from "src/base/react-helper/asyncWrapper";

const pageConfigMap = {
  [EWindowName.Preview]: {
    width: 800,
    height: 800,
    Component: () => import("src/render/pages/preview"),
  },
};

function render(
  windowName: EWindowName,
  props: object,
  sourceWindowId: number
) {
  const windowService = useService<WindowService>("WindowService");
  const window = windowService.window;
  const { width, height, Component } = pageConfigMap[windowName];
  const AsyncComponent = asyncWrapper(Component);

  const sourceWindow = remote.BrowserWindow.fromId(sourceWindowId);
  const handleProps = windowService.propsResolver(sourceWindow, props);

  ReactDom.render(
    <AsyncComponent {...handleProps} />,
    document.querySelector("#root")
  );

  window.setSize(width, height, true);
  window.show();
  window.webContents.openDevTools();
}

module.exports = render;
