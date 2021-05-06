import EventService from "src/base/js-helper/EventService";
import { mergeLeft } from "ramda";
import { TDragInfo } from "./DragService";

export enum EDragContainerEvent {
  destroy = "destroy",
  /** 插入元素 */
  insert = "insert",
  /** 移除元素 */
  remove = "remove",
  mouseleave = "mouseleave",
  mousedown = "mousedown",
}

export enum EDragContainerMode {
  /** 正常模式 拖拽时会删除源元素 */
  normal = "normal",
  /** 模型模式 拖拽时不会删除源元素 且此容器内不会添加拖拽项*/
  model = "model",
}

export type TDragContainerOptions = {
  /** 容器模式 注: 不指定时为normal */
  mode?: EDragContainerMode;
  /** 拖拽项类名 注: 不指定时默认取容器下的第一层子元素 */
  dragItemClassName?: string;
};

type TDragContainerEvent = {
  [EDragContainerEvent.destroy]: () => void;
  [EDragContainerEvent.insert]: (
    target: HTMLElement,
    children: HTMLCollection
  ) => void;
  [EDragContainerEvent.remove]: (target: HTMLElement) => void;
  [EDragContainerEvent.mouseleave]: () => void;
  [EDragContainerEvent.mousedown]: (dragInfo: TDragInfo) => void;
};

/** 拖拽的容器 */
class DragContainer extends EventService<TDragContainerEvent> {
  element: HTMLElement = null;
  options: TDragContainerOptions = null;
  private _needRemoveListeners: Function[] = [];
  private _listenerConfig = {
    mouseleave: () => this._mouseleaveFn,
    mousedown: () => this._mousedownFn,
  };

  constructor(element: HTMLElement, options = {} as TDragContainerOptions) {
    super();
    this.element = element;
    this.options = mergeLeft(options, {
      mode: EDragContainerMode.normal,
      dragItemClassName: null,
    });
    this._listenerRegister();
  }

  /** 事件注册器 */
  private _listenerRegister() {
    for (const [eventName, fn] of Object.entries(this._listenerConfig)) {
      this.element.addEventListener(eventName, fn());

      this._needRemoveListeners.push(() =>
        this.element.removeEventListener(eventName, fn())
      );
    }
  }

  private _mouseleaveFn = () => {
    this.send(EDragContainerEvent.mouseleave);
  };

  private _mousedownFn = (e: MouseEvent) => {
    if (e.target === this.element) return;

    const dragInfo = this._generateDragInfo(e);

    this.send(EDragContainerEvent.mousedown, dragInfo);
  };

  /** 生成拖拽信息 */
  private _generateDragInfo(e: MouseEvent): TDragInfo {
    const { path, offsetX, offsetY } = e;

    const childElement = this.getDragElementByPath(path);
    if (!childElement) return null;

    const absoluteElement = this._createAbsoluteElement(childElement);
    document.body.appendChild(absoluteElement);

    let source = null;
    let placeholder = null;
    if (this.options.mode === EDragContainerMode.normal) {
      const cloneEle = childElement.cloneNode(true);

      source = cloneEle;
      // placeholder = childElement;
    } else if (this.options.mode === EDragContainerMode.model) {
      source = childElement;
    }

    return {
      source,
      absolute: absoluteElement,
      offsetX,
      offsetY,
      placeholder,
      sourceContainer: this,
    };
  }

  /** 通过元素路径获取可拖拽的子元素 */
  getDragElementByPath(path: HTMLElement[]): HTMLElement {
    const { dragItemClassName } = this.options;

    let lastEle = null;
    for (const ele of path) {
      if (dragItemClassName && ele.classList.contains(dragItemClassName)) {
        return ele;
      } else if (ele === this.element) {
        return lastEle;
      }
      lastEle = ele;
    }

    return null;
  }

  /** 克隆出定位的元素 */
  private _createAbsoluteElement(model: HTMLElement): HTMLElement {
    const { width, height } = model.getBoundingClientRect();

    const cloneEle = model.cloneNode(true) as HTMLElement;
    cloneEle.style.position = "absolute";
    cloneEle.style.width = `${width}px`;
    cloneEle.style.height = `${height}px`;
    cloneEle.style.opacity = `${(Number(cloneEle.style.opacity) || 1) * 0.4}`;
    // 鼠标事件透过克隆的元素
    cloneEle.style.pointerEvents = "none";

    return cloneEle;
  }

  destroy() {
    this._needRemoveListeners.forEach((fn) => fn());
  }
}

export default DragContainer;
