import React, { useCallback } from "react";
import { EWindowName } from "src/base/const/type.d";
import { useService } from "src/base/service-manager";
import { WindowService, ExtensionsService } from "src/render/services";

const windowService = useService<WindowService>("WindowService");
const extensionsService = useService<ExtensionsService>("ExtensionsService");

const Preview = (props) => {
  const { onChange, content = "" } = props;

  const onClick = useCallback(() => {
    const a = onChange(123);
    loggerService.log(
      "taozhizhu ~🚀 file: index.tsx ~🚀 line 13 ~🚀 onClick ~🚀 a",
      a
    );
  }, []);
  return <button onClick={onClick}>{content || Preview}</button>;
};

export default windowService.windowWrap(Preview, EWindowName.Preview);
