import React, { useCallback } from "react";
import { EWindowName } from "src/base/const/type.d";
import { useService } from "src/base/service-manager";
import { WindowService } from "src/render/services";

const windowService = useService<WindowService>("WindowService");

const ToolBar = () => {
  const onClick = useCallback(() => {
    windowService.showWindow(EWindowName.Preview, {});
  }, []);

  return (
    <div>
      <button onClick={onClick}>预览</button>
    </div>
  );
};

export default ToolBar;
