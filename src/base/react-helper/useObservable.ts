import { useEffect, useState } from "react";
import { BehaviorSubject, Subject } from "rxjs";

/** 使用Subject类型的数据流 */
function useObservable<T>(
  subject: Subject<T>,
  defaultValue: any = undefined
): T {
  const [state, setState] = useState(
    subject instanceof BehaviorSubject && defaultValue === undefined
      ? subject.getValue()
      : defaultValue
  );

  useEffect(() => {
    subject.subscribe(setState);
  }, []);

  return state;
}

export default useObservable;
