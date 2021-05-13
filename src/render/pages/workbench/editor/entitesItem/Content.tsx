import React, { useMemo } from "react";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";

import style from "./style/content.less";

interface IContentProps {
  componentEntity: TComponentEntity<EComponentMode.container>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  isActive?: boolean;
}

const Content: React.FC<IContentProps> = (props) => {
  const { componentEntity, onClick = noop, isActive = false } = props;
  const { id, attrNode, childNode } = componentEntity;
  const { tag, styles = [] } = attrNode;

  const styleProp = useMemo(() => {
    const styleProp = {};

    for (const { name, value } of styles) {
      styleProp[name] = value;
    }

    return styleProp;
  }, [styles]);

  return React.createElement(
    tag,
    {
      componentid: id,
      className: isActive ? style.active : "",
      style: styleProp,
      onClick,
    },
    [childNode]
  );
};

export default Content;
