import { MAIN_CONTAINER } from "src/base/const";
import { TComponentModel, EComponentMode } from "./type.d";

const componentContainerModels: TComponentModel<EComponentMode.container>[] = [
  {
    type: MAIN_CONTAINER,
    label: MAIN_CONTAINER,
    tag: "div",
    mode: EComponentMode.container,
    attrNode: {
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
    tag: "div",
    mode: EComponentMode.container,
    attrNode: {
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
    tag: "span",
    mode: EComponentMode.content,
    attrNode: {
      styles: [
        {
          name: "color",
          value: "#666",
        },
        {
          name: "fontSize",
          value: "18px",
        },
      ],
    },
    childNode: "span",
  },
  {
    type: "p",
    label: "p",
    tag: "p",
    mode: EComponentMode.content,
    attrNode: {
      styles: [
        {
          name: "color",
          value: "#666",
        },
        {
          name: "fontSize",
          value: "18px",
        },
      ],
    },
    childNode: "p",
  },
];

export default [...componentContainerModels, ...componentContentModels];
