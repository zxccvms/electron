import React, { useCallback, useRef } from "react";
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
    componentModelService.$componentModelMap,
    { useDebounce: true }
  );
  const container = useRef<DragContainer>(null);

  const onInit = useCallback((node: HTMLElement) => {
    if (node) {
      const editorDrag = dragManagerService.get(EDragName.editor);

      container.current = editorDrag.setContainerItem(node, {
        mode: EDragContainerMode.model,
      });
    } else {
      container.current.destroy();
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
