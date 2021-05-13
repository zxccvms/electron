import React from "react";
import { MAIN_CONTAINER } from "src/base/const";
import { EWindowName } from "src/base/const/type.d";
import { If } from "src/base/react-helper/judge";
import useObservable from "src/base/react-helper/useObservable";
import { TRemoteService, useService } from "src/base/service-manager";
import { ComponentEntityService } from "src/render/services";
import Entity from "./Entity";

const componentEntityService = useService<
  TRemoteService<ComponentEntityService>
>("ComponentEntityService", EWindowName.Main);

const Preview = (props) => {
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
