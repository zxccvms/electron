import React, { useMemo } from "react";
import { MAIN_CONTAINER } from "src/base/const";
import useObservable from "src/base/react-helper/useObservable";
import { useService } from "src/base/service-manager";
import { ComponentEntityService } from "src/render/services";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type";
import Container from "./entitesItem/Container";

const componentEntityService = useService<ComponentEntityService>(
  "ComponentEntityService"
);

const Editor = () => {
  const componentEntityMap = useObservable(
    componentEntityService.$componentEntityMap
  );

  const mainContainerEntity = useMemo(
    () =>
      componentEntityService.getComponentEntityById(
        MAIN_CONTAINER
      ) as TComponentEntity<EComponentMode.container>,
    [componentEntityMap]
  );

  return <Container componentEntity={mainContainerEntity} />;
};

export default Editor;
