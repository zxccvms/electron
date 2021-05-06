import React from "react";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";

interface IContentProps {
  componentEntity: TComponentEntity<EComponentMode.container>;
}

const Content: React.FC<IContentProps> = (props) => {
  const { componentEntity } = props;
  const { id, attrNode, childNode } = componentEntity;
  const { tag, style } = attrNode;

  return React.createElement(
    tag,
    {
      componentid: id,
      style,
    },
    [childNode]
  );
};

export default Content;
