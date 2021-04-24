import React, { useCallback } from "react";
import { EWindowName } from "src/base/const/type.d";
import { useService } from "src/base/injecter";
import { WindowService, ExtensionsService } from "src/render/services";

const windowService = useService<WindowService>("WindowService");
const extensionsService = useService<ExtensionsService>("ExtensionsService");

const Preview = (props) => {
  const { onChange } = props;

  const onClick = useCallback(() => {
    const a = onChange(123);
    console.log(
      "taozhizhu ~🚀 file: index.tsx ~🚀 line 13 ~🚀 onClick ~🚀 a",
      a
    );
  }, []);
  return <button onClick={onClick}>Preview</button>;
};

export default windowService.windowWrap(Preview, EWindowName.Preview);
