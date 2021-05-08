import DragContainer, {
  EDragContainerEvent,
  EDragContainerMode,
  TDragContainerOptions,
} from "./DragContainer";

/** 当前拖拽项的类型 */
export type TDragInfo = {
  /** 源元素 */
  source: HTMLElement;
  /** 源容器 */
  sourceContainer: DragContainer;
  /** 定位的元素 */
  absolute: HTMLElement;
  /** 占位的元素 */
  placeholder: HTMLElement;
  /** 鼠标点击的偏移x */
  offsetX: number;
  /** 鼠标点击的偏移y */
  offsetY: number;
  /** 源元素的display */
  display: string;
};

const rootEle = document.getElementById("#root");

/** 拖拽服务 */
class DragService {
  private _containerMap: Map<HTMLElement, DragContainer> = new Map();
  private _dragInfo: TDragInfo = null;
  private _listenerConfig = {
    mousemove: () => this._mousemoveFn,
    mouseup: () => this._mouseupFn,
  };

  constructor() {
    this._listenerRegister();
  }

  setContainerItem(
    ele: HTMLElement,
    options?: TDragContainerOptions
  ): DragContainer {
    const container = new DragContainer(ele, options);

    container.on(EDragContainerEvent.mouseleave, () => {
      if (!this._dragInfo) return;
      this._onDragItemOutContainer();
    });

    container.on(EDragContainerEvent.mousedown, (dragInfo: TDragInfo) => {
      this._dragInfo = dragInfo;
    });

    container.on(EDragContainerEvent.destroy, () => {
      this._containerMap.delete(ele);
    });

    this._containerMap.set(ele, container);

    return container;
  }

  /** 事件注册器 */
  private _listenerRegister() {
    for (const [eventName, fn] of Object.entries(this._listenerConfig)) {
      document.addEventListener(eventName, fn());
    }
  }

  /** 事件注销器 */
  private _listenerDestroy() {
    for (const [eventName, fn] of Object.entries(this._listenerConfig)) {
      document.removeEventListener(eventName, fn());
    }
  }

  private _mousemoveFn = (e: MouseEvent) => {
    e.stopPropagation();
    if (!this._dragInfo) return;

    const {
      source,
      absolute,
      offsetX,
      offsetY,
      sourceContainer,
    } = this._dragInfo;
    absolute.style.top = `${e.y - offsetY}px`;
    absolute.style.left = `${e.x - offsetX}px`;

    if (
      source.style.display !== "none" &&
      sourceContainer.options.mode === EDragContainerMode.normal
    ) {
      source.style.display = "none";
    }

    const containerAndRefChild = this._getContainerAndRefChildByPath(e.path);
    if (!containerAndRefChild) return;

    const [container, refChild] = containerAndRefChild;
    if (container.options.mode === EDragContainerMode.model) return;

    this._onDragItemInContainer(container, refChild);
  };

  private _mouseupFn = (e: MouseEvent) => {
    e.stopPropagation();
    if (!this._dragInfo) return;
    const {
      absolute,
      source,
      placeholder,
      sourceContainer,
      display,
    } = this._dragInfo;

    if (placeholder) {
      const containerAndRefChild = this._getContainerAndRefChildByPath(e.path);
      if (containerAndRefChild) {
        const [targetContainer] = containerAndRefChild;
        targetContainer.send(
          EDragContainerEvent.insert,
          placeholder,
          targetContainer.element.children
        );
        if (sourceContainer === targetContainer) {
          source.style.display = display;
        } else if (targetContainer.options.mode === EDragContainerMode.normal) {
          sourceContainer.send(EDragContainerEvent.move, source);
        } else {
          sourceContainer.send(EDragContainerEvent.delete, source);
        }
      } else {
        sourceContainer.send(EDragContainerEvent.delete, source);
      }

      this._removeElement(placeholder);
    }

    if (absolute) this._removeElement(absolute);

    this._dragInfo = null;
  };

  /** 当拖拽项在容器内时 */
  private _onDragItemInContainer(
    container: DragContainer,
    refChild: HTMLElement
  ) {
    const { element } = container;
    const { source, placeholder, display } = this._dragInfo;

    const newPlaceholder = source.cloneNode(true) as HTMLElement;
    if (newPlaceholder.style.display !== display)
      newPlaceholder.style.display = display;

    if (refChild) {
      element.insertBefore(newPlaceholder, refChild);
    } else {
      element.appendChild(newPlaceholder);
    }

    if (placeholder) this._removeElement(placeholder);

    this._dragInfo.placeholder = newPlaceholder;
  }

  /** 当拖拽项离开容器时 */
  private _onDragItemOutContainer = () => {
    const { placeholder } = this._dragInfo;
    if (placeholder) this._removeElement(placeholder);

    this._dragInfo.placeholder = null;
  };

  /** 得到容器和标记子节点 */
  private _getContainerAndRefChildByPath(
    path: HTMLElement[]
  ): [DragContainer, HTMLElement] {
    let container = null as DragContainer;
    for (const ele of path) {
      if (ele === rootEle) return null;

      if ((container = this._containerMap.get(ele))) break;
    }

    if (!container) return null;
    const refChild = container.getDragElementByPath(path);

    return [container, refChild];
  }

  private _removeElement(ele: HTMLElement) {
    ele.parentElement.removeChild(ele);
  }

  /** drag销毁的方法 */
  destroy = () => {
    this._containerMap.forEach((container) => container.destroy());
    this._listenerDestroy();
  };
}

export default DragService;
