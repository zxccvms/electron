import { MAIN_CONTAINER } from "src/base/const";
import { TComponentModel, EComponentMode } from "./type.d";

const componentContainerModels: TComponentModel<EComponentMode.container>[] = [
  {
    type: MAIN_CONTAINER,
    label: MAIN_CONTAINER,
    mode: EComponentMode.container,
    attrNode: {
      tag: "div",
      style: {
        width: "100%",
        height: "100%",
      },
    },
    childNode: [],
  },
  {
    type: "div",
    label: "div",
    mode: EComponentMode.container,
    attrNode: {
      tag: "div",
      style: {
        width: "100px",
        height: "100px",
        border: "1px solid #666",
      },
    },
    childNode: [],
  },
];

const componentContentModels: TComponentModel<EComponentMode.content>[] = [
  {
    type: "span",
    label: "span",
    mode: EComponentMode.content,
    attrNode: {
      tag: "span",
      style: {},
    },
    childNode: "span",
  },
  {
    type: "p",
    label: "p",
    mode: EComponentMode.content,
    attrNode: {
      tag: "p",
      style: {},
    },
    childNode: "p",
  },
];

export default [...componentContainerModels, ...componentContentModels];
