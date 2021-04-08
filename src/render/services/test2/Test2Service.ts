import { injectable, inject } from "src/render/utils/injecter";
import TestService from "src/render/services/test/TestService";

@injectable()
class Test2Service {
  @inject() testService: TestService;

  private _constructor() {
    this.testService.print2("init Test2Service");
  }

  print(content: string) {
    console.log("Test2Service print: ", content);
  }
}

export default Test2Service;
