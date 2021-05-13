import { MAIN_CONTAINER } from "src/base/const";
import { TComponentModel, EComponentMode } from "./type.d";

const componentContainerModels: TComponentModel<EComponentMode.container>[] = [
  {
    type: MAIN_CONTAINER,
    label: MAIN_CONTAINER,
    mode: EComponentMode.container,
    attrNode: {
      tag: "div",
      styles: [
        {
          name: "width",
          value: "100%",
        },
        {
          name: "height",
          value: "100%",
        },
      ],
    },
    childNode: [],
  },
  {
    type: "div",
    label: "div",
    mode: EComponentMode.container,
    attrNode: {
      tag: "div",
      styles: [
        {
          name: "width",
          value: "100px",
        },
        {
          name: "height",
          value: "100px",
        },
        {
          name: "border",
          value: "1px solid #666",
        },
      ],
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
      styles: [
        {
          name: "color",
          value: "#666",
        },
      ],
    },
    childNode: "span",
  },
  {
    type: "p",
    label: "p",
    mode: EComponentMode.content,
    attrNode: {
      tag: "p",
      styles: [
        {
          name: "color",
          value: "#666",
        },
      ],
    },
    childNode: "p",
  },
];

export default [...componentContainerModels, ...componentContentModels];
