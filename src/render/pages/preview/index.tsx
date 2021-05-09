import React, { useCallback } from "react";
import { MAIN_CONTAINER } from "src/base/const";
import { EWindowName } from "src/base/const/type.d";
import useObservable from "src/base/react-helper/useObservable";
import { TRemoteService, useService } from "src/base/service-manager";
import { ComponentEntityService, WindowService } from "src/render/services";

const windowService = useService<WindowService>("WindowService");
const componentEntityService = useService<
  TRemoteService<ComponentEntityService>
>("ComponentEntityService", EWindowName.Main);

const Preview = (props) => {
  const componentEntityMap = useObservable(
    componentEntityService.$componentEntityMap,
    {
      defaultValue: {},
    }
  );
  console.log(
    "taozhizhu ~🚀 file: index.tsx ~🚀 line 20 ~🚀 Preview ~🚀 componentEntityMap",
    componentEntityMap
  );

  const onClick = useCallback(async () => {
    const result = await componentEntityService.getAllChildNodes(
      MAIN_CONTAINER
    );
    console.log(
      "taozhizhu ~🚀 file: index.tsx ~🚀 line 28 ~🚀 onClick ~🚀 result",
      result
    );
  }, []);
  return <button onClick={onClick}>1</button>;
};

export default windowService.windowWrap(Preview, EWindowName.Preview);
