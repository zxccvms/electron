import React, { useMemo } from "react";
import { useService } from "src/base/service-manager";
import { ComponentHandlerService } from "src/render/services";
import {
  EComponentMode,
  TComponentEntity,
  TComponentEntityMap,
} from "src/render/services/editor/type.d";

const componentHandlerService = useService<ComponentHandlerService>(
  "ComponentHandlerService"
);

interface IEntityProps {
  componentEntity: TComponentEntity;
  componentEntityMap: TComponentEntityMap;
}

const Entity: React.FC<IEntityProps> = (props) => {
  const { componentEntity, componentEntityMap } = props;
  const { id, tag, attrNode, childNode, mode } = componentEntity;
  const { styles = [] } = attrNode;

  const styleProp = useMemo(() => {
    return componentHandlerService.stylesAttrItemToStyleProp(styles);
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
