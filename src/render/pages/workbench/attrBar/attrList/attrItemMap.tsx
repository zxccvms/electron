import React from "react";
import { Input } from "ui-lib";

const attrItemMap = {
  input: (value, onChange = noop) => (
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  ),
};

export default attrItemMap;
