import React, { useEffect, useState } from "react";
import { useAsyncService } from "src/render/utils/react-help/asyncWrap";
import TestService from "src/render/services/test/TestService";

const testService = useAsyncService<TestService>("TestService");

const Home = () => {
  useEffect(() => {
    testService.print("Home");
  }, []);

  return <div>Home</div>;
};

export default Home;
