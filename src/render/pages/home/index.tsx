import React, { useCallback, useEffect, useState } from "react";
import { TestService } from "src/render/services";
import { MainTestService } from "src/main/services";
import { useService } from "src/base/injecter";
import { MAIN_PROCESS } from "src/base/const";

const testService = useService<TestService>("TestService", "child");
const mainTestService = useService<MainTestService>(
  "MainTestService",
  MAIN_PROCESS
);

const Home = () => {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [history1, setHistory1] = useState([]);

  useEffect(() => {
    testService.$printHistory.subscribe((history) => setHistory([...history]));
    mainTestService.$printHistory.subscribe((history) =>
      setHistory1([...history])
    );
  }, []);

  const onClick = useCallback(() => {
    testService.print(value);
    setValue("");
  }, [value]);

  const onClick1 = useCallback(() => {
    mainTestService.print(value);
    setValue("");
  }, [value]);

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={onClick}>send to window</button>
      <button onClick={onClick1}>send to main</button>
      <div>
        <div>{history}</div>
        <div>{history1}</div>
      </div>
    </div>
  );
};

export default Home;
