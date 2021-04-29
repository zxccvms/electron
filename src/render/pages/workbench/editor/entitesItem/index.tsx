import React from "react";
import { useService } from "src/base/service-manager";

const EntitesItem = (props) => {
  const { componentEntites } = props;

  return <div>{componentEntites.label}</div>;
};

export default EntitesItem;
