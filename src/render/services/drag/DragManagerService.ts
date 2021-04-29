import { injectable } from "src/base/service-manager";
import DragService from "./DragService";

export enum EDragName {
  editor = "editor",
}

@injectable("DragManagerService")
class DragManagerService {
  private _dragMap: Map<string, DragService> = new Map();

  get(dragName: string) {
    const drag = this._dragMap.get(dragName);
    if (drag) return drag;
    return this._createDrag(dragName);
  }

  private _createDrag(dragName: string) {
    let drag = new DragService();

    const destroy = drag.destroy;

    drag.destroy = () => {
      this._dragMap.delete(dragName);
      destroy();
    };

    this._dragMap.set(dragName, drag);

    return drag;
  }
}

export default DragManagerService;
