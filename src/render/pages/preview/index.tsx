import React, { useMemo } from "react";
import { MAIN_CONTAINER } from "src/base/const";
import { EWindowName } from "src/base/const/types.d";
import { If } from "src/base/react-helper/judge";
import useObservable from "src/base/react-helper/useObservable";
import { TRemoteService, useService } from "src/base/service-manager";
import { ComponentManagerService } from "src/render/services";
import Entity from "./Entity";

const componentManagerService = useService<
  TRemoteService<ComponentManagerService>
>("ComponentManagerService", EWindowName.Main);

const Preview = (props) => {
  const { filePath } = props;

  const componentEntityService = useMemo(
    () => componentManagerService.getComponentEntityService(filePath),
    [filePath]
  );

  const componentEntityMap = useObservable(
    componentEntityService.$componentEntityMap,
    {
      defaultValue: {},
      useDebounce: true,
    }
  );

  return (
    <If
      condition={Boolean(componentEntityMap[MAIN_CONTAINER])}
      render={() => (
        <Entity
          componentEntityMap={componentEntityMap}
          componentEntity={componentEntityMap[MAIN_CONTAINER]}
        />
      )}
    />
  );
};

export default Preview;
