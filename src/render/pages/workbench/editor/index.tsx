import React, { useCallback } from "react";
import useObservable from "src/base/react-helper/useObservable";
import { useService } from "src/base/service-manager";
import {
  ComponentEntitesService,
  DragManagerService,
} from "src/render/services";
import DragContainer, {
  EDragContainerEvent,
} from "src/render/services/drag/DragContainer";
import { EDragName } from "src/render/services/drag/DragManagerService";
import { Panel } from "src/render/ui-lib";
import EntitesItem from "./entitesItem";

const dragManagerService = useService<DragManagerService>("DragManagerService");
const componentEntitesService = useService<ComponentEntitesService>(
  "ComponentEntitesService"
);

const Editor = () => {
  const componentEntitesMap = useObservable(
    componentEntitesService.$componentEntitesMap
  );

  const onInit = useCallback((node: HTMLElement) => {
    let container = null as DragContainer;
    if (node) {
      const editorDrag = dragManagerService.get(EDragName.editor);

      container = editorDrag.setContainerItem(node);

      container.on(EDragContainerEvent.append, (target: HTMLElement) => {
        const type = target.getAttribute("type");
        componentEntitesService.createComponentEntites(type);
      });

      container.on(EDragContainerEvent.sort, (eles: HTMLCollection) => {});
    } else {
      container.destroy();
    }
  }, []);

  return (
    <Panel flex="1" flexDirection="column" border="1px solid #666" ref={onInit}>
      {Object.values(componentEntitesMap).map((componentEntites) => (
        <EntitesItem
          componentEntites={componentEntites}
          key={componentEntites.id}
        />
      ))}
    </Panel>
  );
};

export default Editor;
