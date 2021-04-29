class EventService<T extends { [key: string]: (...params: any[]) => any }> {
  private _eventMap: Map<keyof T, T[keyof T][]> = new Map();

  on(eventName: keyof T, cb: T[keyof T]) {
    const fns = this._eventMap.get(eventName) || [];
    fns.push(cb);

    this._eventMap.set(eventName, [...fns]);
  }

  send(
    eventName: keyof T,
    ...params: Parameters<T[keyof T]>
  ): ReturnType<T[keyof T]>[] {
    const fns = this._eventMap.get(eventName);
    if (!fns) return [];

    return fns.map((fn) => fn(...params));
  }
}

export default EventService;
