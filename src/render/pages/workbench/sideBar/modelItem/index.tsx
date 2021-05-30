import React from "react";
import {
  EComponentMode,
  TComponentModel,
} from "src/render/services/editor/type";

import style from "./index.less";

interface IModelItemProps {
  componentModel: TComponentModel;
}

const ModelItem: React.FC<IModelItemProps> = (props) => {
  const { componentModel } = props;

  return (
    <div className={style.modelItem} componenttype={componentModel.type}>
      {componentModel.label}
    </div>
  );
};

export default ModelItem;
