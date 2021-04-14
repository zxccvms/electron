import React, { useEffect } from "react";
import { useService } from "src/base/injecter";
import { ExtensionsService } from "src/render/services";

const extensionsService = useService<ExtensionsService>("ExtensionsService");

const Extension = () => {
  useEffect(() => {
    extensionsService.loader("C:/Users/cjc/Desktop/electron/test");
  }, []);

  return <div>extension</div>;
};

export default Extension;
