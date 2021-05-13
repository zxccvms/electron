import React, { useMemo } from "react";
import {
  EComponentMode,
  TComponentEntity,
  TComponentEntityMap,
} from "src/render/services/editor/type.d";

interface IEntityProps {
  componentEntity: TComponentEntity<EComponentMode>;
  componentEntityMap: TComponentEntityMap;
}

const Entity: React.FC<IEntityProps> = (props) => {
  const { componentEntity, componentEntityMap } = props;
  const { id, attrNode, childNode, mode } = componentEntity;
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
      style: styleProp,
    },
    [
      mode === EComponentMode.content
        ? childNode
        : (childNode as string[]).map((id) => (
            <Entity
              key={id}
              componentEntityMap={componentEntityMap}
              componentEntity={componentEntityMap[id]}
            />
          )),
    ]
  );
};

export default Entity;
