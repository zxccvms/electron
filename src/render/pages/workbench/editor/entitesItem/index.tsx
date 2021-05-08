import React, { useCallback, useMemo } from "react";
import useObservable from "src/base/react-helper/useObservable";
import { useService } from "src/base/service-manager";
import { ComponentEntityService } from "src/render/services";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";

import Container from "./Container";
import Content from "./Content";

const componentEntityService = useService<ComponentEntityService>(
  "ComponentEntityService"
);

interface IEntitesItemProps {
  componentEntity: TComponentEntity<EComponentMode>;
}

const EntityItem: React.FC<IEntitesItemProps> = (props) => {
  const { componentEntity } = props;
  const selectedIds = useObservable(componentEntityService.$selectedIds);

  const isActive = useMemo(
    () => selectedIds.indexOf(componentEntity.id) !== -1,
    [selectedIds]
  );

  const onClick = useCallback(
    (e) => {
      e.stopPropagation();

      componentEntityService.setSelectedIds([componentEntity.id]);
    },
    [componentEntity]
  );

  const Entity = useMemo(
    () =>
      componentEntity.mode === EComponentMode.container ? Container : Content,
    [componentEntity]
  );

  return (
    <Entity
      componentEntity={componentEntity}
      onClick={onClick}
      isActive={isActive}
    />
  );
};

export default EntityItem;
