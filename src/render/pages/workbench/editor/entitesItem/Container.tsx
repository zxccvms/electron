import React, { useCallback, useMemo, useRef } from "react";
import { useService } from "src/base/service-manager";
import {
  ComponentEntityService,
  ComponentHandlerService,
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

import style from "./style/container.less";

const componentEntityService = useService<ComponentEntityService>(
  "ComponentEntityService"
);
const componentHandlerService = useService<ComponentHandlerService>(
  "ComponentHandlerService"
);
const dragManagerService = useService<DragManagerService>("DragManagerService");

interface IContainerProps {
  componentEntity: TComponentEntity<EComponentMode.container>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  isActive?: boolean;
}

const Container: React.FC<IContainerProps> = (props) => {
  const { componentEntity, onClick = noop, isActive = false } = props;
  const { id, tag, attrNode, childNode = [] } = componentEntity;
  const { styles = [] } = attrNode;
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

          componentEntityService.insertComponentEntityInContainer(
            componentEntity.id,
            {
              index,
              entityId,
            }
          );
        }
      );

      container.current.on(EDragContainerEvent.move, (target: HTMLElement) => {
        const id = target.getAttribute("componentid");

        componentEntityService.removeComponentEntityInContainer(
          componentEntity.id,
          id
        );
      });

      container.current.on(
        EDragContainerEvent.delete,
        (target: HTMLElement) => {
          const id = target.getAttribute("componentid");

          componentEntityService.deleteComponentEntityById(id);
        }
      );
    } else {
      container.current.destroy();
    }
  }, []);

  const styleProp = useMemo(() => {
    return componentHandlerService.stylesAttrItemToStyleProp(styles);
  }, [styles]);

  return React.createElement(
    tag,
    {
      componentid: id,
      className: isActive ? style.active : "",
      style: styleProp,
      onClick,
      ref: onInit,
    },
    childNode.map((id) => {
      const childEntity = componentEntityService.getComponentEntityById(id);
      return <EntityItem componentEntity={childEntity} key={id} />;
    })
  );
};

export default Container;
