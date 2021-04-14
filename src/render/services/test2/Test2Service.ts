import { injectable, inject } from "src/base/injecter";
import TestService from "src/render/services/test/TestService";

@injectable("Test2Service")
class Test2Service {
  // @inject() testService: TestService;

  private _constructor() {
    // this.testService.print("init Test2Service");
  }

  print(content: string) {
    console.log("Test2Service print: ", content);
  }
}

export default Test2Service;
