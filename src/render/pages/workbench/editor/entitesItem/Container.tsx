import React, { useCallback, useMemo } from "react";
import { useService } from "src/base/service-manager";
import {
  ComponentEntityService,
  DragManagerService,
} from "src/render/services";
import DragContainer, {
  EDragContainerEvent,
} from "src/render/services/drag/DragContainer";
import { EDragName } from "src/render/services/drag/DragManagerService";
import {
  EComponentMode,
  TComponentEntity,
} from "src/render/services/editor/type.d";
import EntityItem from "./index";

const componentEntityService = useService<ComponentEntityService>(
  "ComponentEntityService"
);
const dragManagerService = useService<DragManagerService>("DragManagerService");

interface IContainerProps {
  componentEntity: TComponentEntity<EComponentMode.container>;
}

const Container: React.FC<IContainerProps> = (props) => {
  const { componentEntity } = props;
  const { id, attrNode, childNode = [] } = componentEntity;
  const { tag, style } = attrNode;

  const onInit = useCallback((node: HTMLElement) => {
    let container = null as DragContainer;
    if (node) {
      const editorDrag = dragManagerService.get(EDragName.editor);
      container = editorDrag.setContainerItem(node);

      container.on(
        EDragContainerEvent.insert,
        (target: HTMLElement, eles: HTMLCollection) => {
          const type = target.getAttribute("componenttype");

          const index = Array.from(eles).findIndex((ele) => ele === target);
          const entityId = type
            ? componentEntityService.createComponentEntity(type).id
            : target.getAttribute("componentid");

          componentEntityService.insertComponentEntity(componentEntity.id, {
            index,
            entityId,
          });
        }
      );

      container.on(EDragContainerEvent.remove, (target) => {
        const id = target.getAttribute("componentid");

        componentEntityService.removeComponentEntity(componentEntity.id, id);
      });
    } else {
      container.destroy();
    }
  }, []);

  const childEntities = useMemo(
    () =>
      childNode.map((id) => componentEntityService.getComponentEntityById(id)),
    [childNode]
  );

  return React.createElement(
    tag,
    {
      componentid: id,
      style,
      ref: onInit,
    },
    childEntities.map((childEntity) => (
      <EntityItem componentEntity={childEntity} key={childEntity.id} />
    ))
  );
};

export default Container;
