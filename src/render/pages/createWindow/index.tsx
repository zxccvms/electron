import React, { useCallback } from "react";
import { EWindowName } from "src/base/const/type.d";
import { useService } from "src/base/injecter";
import { WindowService } from "src/render/services";

const windowService = useService<WindowService>("WindowService");

const CreateWindow = () => {
  const onClick = useCallback(() => {
    windowService.showWindow(EWindowName.Preview, {
      onChange: (content) => {
        console.log(content);
      },
    });
    // Preview.showWindow({
    //   onChange: (content) => {
    //     console.log(content);
    //     return content;
    //   },
    // });
  }, []);

  return <button onClick={onClick}>创建窗口</button>;
};

export default CreateWindow;
