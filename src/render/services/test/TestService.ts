import { inject, injectable } from "src/render/utils/injecter";
import Test2Service from "src/render/services/test2/Test2Service";

@injectable()
class TestService {
  @inject() test2Service: Test2Service;

  private _constructor() {
    this.test2Service.print("init TestService");
  }

  print(content: string) {
    console.log("TestService print: ", content);
    this.test2Service.print(content);
  }

  print2(content: string) {
    console.log("TestService print2: ", content);
  }
}

export default TestService;
