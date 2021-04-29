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
  /** 目标容器 */
  // targetContainer: DragContainer;
  /** 定位的元素 */
  absolute: HTMLElement;
  /** 占位的元素 */
  placeholder: HTMLElement;
  /** 鼠标点击的偏移x */
  offsetX: number;
  /** 鼠标点击的偏移y */
  offsetY: number;
};

const rootEle = document.getElementById("#root");

/** 拖拽服务 */
class DragService {
  private _containerMap: Map<HTMLElement, DragContainer> = new Map();
  private _dragInfo: TDragInfo = null;
  private _needRemoveListeners: Function[] = [];
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

    this._containerMap.set(ele, container);

    return container;
  }

  /** 事件注册器 */
  private _listenerRegister() {
    for (const [eventName, fn] of Object.entries(this._listenerConfig)) {
      document.addEventListener(eventName, fn());

      this._needRemoveListeners.push(() =>
        document.removeEventListener(eventName, fn())
      );
    }
  }

  private _mousemoveFn = (e: MouseEvent) => {
    if (!this._dragInfo) return;

    const { absolute, offsetX, offsetY } = this._dragInfo;
    absolute.style.top = `${e.y - offsetY}px`;
    absolute.style.left = `${e.x - offsetX}px`;

    const containerAndRefChild = this._getContainerAndRefChildByPath(e.path);
    if (!containerAndRefChild) return;

    const [container, refChild] = containerAndRefChild;
    if (container.options.mode === EDragContainerMode.model) return;

    this._onDragItemInContainer(container, refChild);
  };

  private _mouseupFn = (e: MouseEvent) => {
    if (!this._dragInfo) return;
    const { absolute, source, placeholder, sourceContainer } = this._dragInfo;

    const containerAndRefChild = this._getContainerAndRefChildByPath(e.path);

    if (containerAndRefChild) {
      const [targetContainer] = containerAndRefChild;

      if (sourceContainer === targetContainer) {
        targetContainer.send(
          EDragContainerEvent.sort,
          targetContainer.element.children
        );
      } else {
        if (placeholder) this._removeElement(placeholder);
        targetContainer.send(
          EDragContainerEvent.append,
          source,
          targetContainer.element.children
        );
      }
    }

    if (absolute) this._removeElement(absolute);

    this._dragInfo = null;
  };

  /** 当拖拽项在容器内时 */
  private _onDragItemInContainer(
    container: DragContainer,
    childEle: HTMLElement
  ) {
    const { element } = container;
    const { source, placeholder } = this._dragInfo;

    const newPlaceholder = source.cloneNode(true);

    if (childEle) {
      element.insertBefore(newPlaceholder, childEle);
    } else {
      element.appendChild(newPlaceholder);
    }

    if (placeholder) this._removeElement(placeholder);

    this._dragInfo.placeholder = newPlaceholder as HTMLElement;
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

    const refChild = container.getDragElementByPath(path);

    return [container, refChild];
  }

  private _removeElement(ele: HTMLElement) {
    ele.parentElement.removeChild(ele);
  }

  /** drag销毁的方法 */
  destroy = () => {
    this._containerMap.forEach((container) => container.destroy());
    this._needRemoveListeners.forEach((fn) => fn());
  };
}

export default DragService;
