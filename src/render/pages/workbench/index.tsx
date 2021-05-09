import React from "react";
import { Panel } from "ui-lib";

import ToolBar from "./toolBar";
import SideBar from "./sideBar";
import Editor from "./editor";
import AttrBar from "./attrBar";

const Workbench = () => {
  return (
    <Panel flexDirection="column" height="100%">
      <Panel flex="0 0 20px" borderBottom="1px solid #666">
        <ToolBar />
      </Panel>
      <Panel flex="1">
        <SideBar />
        <Editor />
        <AttrBar />
      </Panel>
    </Panel>
  );
};

export default Workbench;
