import React, { useMemo } from "react";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";

import Container from "./Container";
import Content from "./Content";

interface IEntitesItemProps {
  componentEntity: TComponentEntity<EComponentMode>;
}

const EntityItem: React.FC<IEntitesItemProps> = (props) => {
  const { componentEntity } = props;

  const Entity = useMemo(
    () =>
      componentEntity.mode === EComponentMode.container ? Container : Content,
    [componentEntity]
  );

  return <Entity componentEntity={componentEntity} />;
};

export default EntityItem;
