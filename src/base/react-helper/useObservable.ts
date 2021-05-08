import { useEffect, useState } from "react";
import { BehaviorSubject, Subject, timer } from "rxjs";
import { debounce } from "rxjs/operators";

type TOptions = {
  defaultValue: any;
  useDebounce: boolean;
  timeout: number;
};

/** 使用Subject类型的数据流 */
function useObservable<T>(subject: Subject<T>, options?: TOptions): T {
  const { defaultValue = undefined, useDebounce = true, timeout = 100 } =
    options || {};
  const [state, setState] = useState(
    subject instanceof BehaviorSubject && defaultValue === undefined
      ? subject.getValue()
      : defaultValue
  );

  useEffect(() => {
    (useDebounce
      ? subject.pipe(debounce(() => timer(timeout)))
      : subject
    ).subscribe(setState);
  }, []);

  return state;
}

export default useObservable;
