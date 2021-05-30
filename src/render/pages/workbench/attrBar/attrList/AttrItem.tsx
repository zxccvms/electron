import React, { useMemo } from "react";
import {
  EComponentMode,
  TAttrItem,
  TComponentEntity,
} from "src/render/services/editor/type.d";
import { Panel } from "ui-lib";
import attrItemMap from "./attrItemMap";

interface IAttrItemProps {
  attrItem: TAttrItem<any>;
  componentEntity: TComponentEntity;
  onChange: (value: any) => void;
}

const AttrItem: React.FC<IAttrItemProps> = (props) => {
  const { attrItem, onChange = noop, componentEntity } = props;
  const { value = "", name } = attrItem;

  return (
    <Panel padding="0 5px">
      <div>{name}</div>
      <div>
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Panel>
  );
};

export default AttrItem;
