import React from "react";

interface IIfProps {
  condition: boolean;
  render: () => React.ReactNode;
}

export const If: React.FC<IIfProps> = (props) => {
  const { condition = false, render } = props;

  return <>{condition && render()}</>;
};
