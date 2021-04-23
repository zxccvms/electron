import React, { useCallback, useEffect } from "react";
import { useService } from "src/base/injecter";
import { ExtensionsService } from "src/render/services";
import { remote } from "electron";

const extensionsService = useService<ExtensionsService>("ExtensionsService");

const Extension = () => {
  const onClick = useCallback(async () => {
    const { filePaths } = await remote.dialog.showOpenDialog({
      properties: ["openFile"],
    });

    const filePath = filePaths[0];
    extensionsService.loader(filePath);
  }, []);

  return <button onClick={onClick}>选择插件文件</button>;
};

export default Extension;
