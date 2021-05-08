import React, { useCallback, useMemo } from "react";
import {
  EComponentMode,
  TAttr,
  TComponentEntity,
} from "src/render/services/editor/type.d";
import { Panel } from "ui-lib";
import AttrItem from "./AttrItem";
import { useService } from "src/base/service-manager";
import { ComponentEntityService } from "src/render/services";

const componentEntityService = useService<ComponentEntityService>(
  "ComponentEntityService"
);

interface IAttrListProps {
  componentEntity: TComponentEntity<EComponentMode>;
}

const AttrList: React.FC<IAttrListProps> = (props) => {
  const { componentEntity } = props;
  const { attrNode } = componentEntity;
  const { style } = attrNode;

  const attrs: TAttr[] = useMemo(() => {
    const attrs = [];
    for (const key in style) {
      attrs.push({
        name: key,
        value: style[key],
      });
    }

    return attrs;
  }, [style]);

  const onChange = useCallback((name, value) => {
    componentEntityService.updateComponentEntity(componentEntity.id, {
      attrNode: {
        style: {
          [name]: value,
        },
      },
    });
  }, []);

  return (
    <Panel flexDirection="column">
      {attrs.map((attr) => (
        <AttrItem
          attr={attr}
          onChange={(value) => onChange(attr.name, value)}
          componentEntity={componentEntity}
          key={attr.name}
        />
      ))}
    </Panel>
  );
};

export default AttrList;
