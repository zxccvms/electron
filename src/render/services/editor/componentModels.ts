import { TComponentModel, EComponentMode } from "./type.d";

const componentContainerModels: TComponentModel<EComponentMode.container>[] = [
  {
    type: "div",
    label: "div",
    mode: EComponentMode.container,
  },
];

const componentContentModels: TComponentModel<EComponentMode.content>[] = [
  {
    type: "span",
    label: "span",
    mode: EComponentMode.content,
  },
];

export default [...componentContainerModels, ...componentContentModels];
