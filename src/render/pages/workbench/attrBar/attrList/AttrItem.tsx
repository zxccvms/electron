import React from "react";
import {
  EComponentMode,
  TAttr,
  TComponentEntity,
} from "src/render/services/editor/type.d";
import { Panel } from "ui-lib";
import attrItemMap from "./attrItemMap";

interface IAttrItemProps {
  attr: TAttr;
  componentEntity: TComponentEntity<EComponentMode>;
  onChange: (value: any) => void;
}

const AttrItem: React.FC<IAttrItemProps> = (props) => {
  const { attr, componentEntity, onChange = noop } = props;
  const { value = "", name } = attr;

  return (
    <Panel padding="0 5px">
      <div>{name}</div>
      <div>{attrItemMap.input(value, onChange)}</div>
    </Panel>
  );
};

export default AttrItem;
