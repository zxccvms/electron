import React from "react";
import ReactDom from "react-dom";

import Extension from "./pages/extension";
import CreateWindow from "./pages/createWindow";

const IndexApp = (props) => {
  return (
    <div>
      <Extension />
      <CreateWindow />
    </div>
  );
};

ReactDom.render(<IndexApp />, document.querySelector("#root"));
