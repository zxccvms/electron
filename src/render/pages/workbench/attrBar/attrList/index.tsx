import React, { useCallback, useMemo } from "react";
import {
  EComponentMode,
  TAttrNode,
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
  const { styles = [] } = componentEntity.attrNode;

  const onChange = useCallback(
    (key: keyof TAttrNode, index, value) => {
      componentEntityService.updateComponentEntityAttrItem(
        {
          id: componentEntity.id,
          key,
          index,
        },
        {
          value,
        }
      );
    },
    [componentEntity]
  );

  return (
    <Panel flexDirection="column">
      {styles.map((attrItem, index) => (
        <AttrItem
          attrItem={attrItem}
          onChange={(value) => onChange("styles", index, value)}
          componentEntity={componentEntity}
          key={attrItem.name}
        />
      ))}
    </Panel>
  );
};

export default AttrList;
