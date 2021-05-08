import React from "react";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";

import styles from "./style/content.less";

interface IContentProps {
  componentEntity: TComponentEntity<EComponentMode.container>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  isActive?: boolean;
}

const Content: React.FC<IContentProps> = (props) => {
  const { componentEntity, onClick = noop, isActive = false } = props;
  const { id, attrNode, childNode } = componentEntity;
  const { tag, style } = attrNode;

  return React.createElement(
    tag,
    {
      componentid: id,
      className: isActive ? styles.active : "",
      style,
      onClick,
    },
    [childNode]
  );
};

export default Content;
