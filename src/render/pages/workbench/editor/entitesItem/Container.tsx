import React, { useCallback, useMemo, useRef } from "react";
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
  const container = useRef<DragContainer>(null);

  const onInit = useCallback((node: HTMLElement) => {
    if (node) {
      const editorDrag = dragManagerService.get(EDragName.editor);
      container.current = editorDrag.setContainerItem(node);

      container.current.on(
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

      container.current.on(EDragContainerEvent.remove, (target) => {
        const id = target.getAttribute("componentid");

        componentEntityService.removeComponentEntity(componentEntity.id, id);
      });
    } else {
      container.current.destroy();
    }
  }, []);

  return React.createElement(
    tag,
    {
      componentid: id,
      style,
      ref: onInit,
    },
    childNode.map((id) => {
      const childEntity = componentEntityService.getComponentEntityById(id);
      return <EntityItem componentEntity={childEntity} key={id} />;
    })
  );
};

export default Container;
