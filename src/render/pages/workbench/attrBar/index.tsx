import React, { useMemo } from "react";
import { If } from "src/base/react-helper/judge";
import useObservable from "src/base/react-helper/useObservable";
import { useService } from "src/base/service-manager";
import { ComponentEntityService } from "src/render/services";
import { Panel } from "src/render/ui-lib";
import AttrList from "./attrList";

const componentEntityService = useService<ComponentEntityService>(
  "ComponentEntityService"
);

const AttrBar = () => {
  const componentMap = useObservable(
    componentEntityService.$componentEntityMap
  );
  const selectedIds = useObservable(componentEntityService.$selectedIds);

  const componentEntity = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    else return componentEntityService.getComponentEntityById(selectedIds[0]);
  }, [componentMap, selectedIds]);

  return (
    <Panel flex="0 0 100px">
      <If
        condition={Boolean(componentEntity)}
        render={() => <AttrList componentEntity={componentEntity} />}
      />
    </Panel>
  );
};

export default AttrBar;
