import React from "react";
import ReactDom from "react-dom";

import Home from "./pages/home";
import Extension from "./pages/extension";

const App = (props) => {
  return (
    <div>
      <Extension />
    </div>
  );
};

ReactDom.render(<App />, document.querySelector("#root"));
