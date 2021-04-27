import React, { useCallback, useEffect } from "react";
import { EWindowName } from "src/base/const/type.d";
import { useService, useAction } from "src/base/injecter";
import { WindowService } from "src/render/services";

// const windowService = useService<WindowService>("WindowService");

const CreateWindow = () => {
  const onClick = useCallback(() => {
    useAction({
      action: "WindowService/showWindow",
      params: [
        EWindowName.Preview,
        {
          a: {
            b: 1,
          },
          content: "1234",
          array: [1, 2, 3],
          onChange: (content) => {
            console.log(content);
          },
          onChange1: (content) => {
            console.log(content);
          },
        },
      ],
    });
    // windowService.showWindow(EWindowName.Preview, {
    //   a: {
    //     b: 1,
    //   },
    //   content: "1234",
    //   array: [1, 2, 3],
    //   onChange: (content) => {
    //     console.log(content);
    //   },
    //   onChange1: (content) => {
    //     console.log(content);
    //   },
    // });
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
