import React from "react";

import style from "./index.less";

interface IPanelProps {
  className?: string;
  children?: React.ReactNode;
}

const Panel: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.CSSProperties & IPanelProps
> = (props, ref) => {
  const { children, className = "", ...styleMap } = props;

  return (
    <div className={`${style.panel}  ${className}`} style={styleMap} ref={ref}>
      {children}
    </div>
  );
};

export default React.forwardRef(Panel);
