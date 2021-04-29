import React from "react";
import ReactDom from "react-dom";

import Workbench from "src/render/pages/workbench";

const IndexApp = (props) => {
  return (
    <>
      <Workbench />
    </>
  );
};

ReactDom.render(<IndexApp />, document.querySelector("#root"));
