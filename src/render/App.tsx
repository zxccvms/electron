import React from "react";
import ReactDom from "react-dom";

import Home from "./pages/home";

const App = (props) => {
  return (
    <div>
      <Home />
    </div>
  );
};

ReactDom.render(<App />, document.querySelector("#root"));
