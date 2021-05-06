import React, { useCallback } from "react";
import { MAIN_CONTAINER } from "src/base/const";
import useObservable from "src/base/react-helper/useObservable";
import { useService } from "src/base/service-manager";
import { ComponentModelService, DragManagerService } from "src/render/services";
import DragContainer, {
  EDragContainerMode,
} from "src/render/services/drag/DragContainer";
import { EDragName } from "src/render/services/drag/DragManagerService";
import { Panel } from "ui-lib";
import ModelItem from "./modelItem";

const componentModelService = useService<ComponentModelService>(
  "ComponentModelService"
);
const dragManagerService = useService<DragManagerService>("DragManagerService");

const SideBar = () => {
  const componentModelMap = useObservable(
    componentModelService.$componentModelMap
  );

  const onInit = useCallback((node: HTMLElement) => {
    let container = null as DragContainer;
    if (node) {
      const editorDrag = dragManagerService.get(EDragName.editor);

      container = editorDrag.setContainerItem(node, {
        mode: EDragContainerMode.model,
      });
    } else {
      container.destroy();
    }
  }, []);

  return (
    <Panel flex="0 0 100px" flexDirection="column" ref={onInit}>
      {Object.values(componentModelMap)
        .filter((componentModel) => componentModel.type !== MAIN_CONTAINER)
        .map((componentModel) => (
          <ModelItem
            componentModel={componentModel}
            key={componentModel.type}
          />
        ))}
    </Panel>
  );
};

export default SideBar;
