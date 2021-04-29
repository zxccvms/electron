import React from "react";
import {
  EComponentMode,
  TComponentModel,
} from "src/render/services/editor/type";
import { Panel } from "ui-lib";

import style from "./index.less";

interface IModelItemProps {
  componentModel: TComponentModel<EComponentMode>;
}

const ModelItem: React.FC<IModelItemProps> = (props) => {
  const { componentModel } = props;

  return (
    <div className={style.modelItem} type={componentModel.type}>
      {componentModel.label}
    </div>
  );
};

export default ModelItem;
