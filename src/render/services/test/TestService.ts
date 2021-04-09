import { inject, injectable } from "src/utils/injecter";
import Test2Service from "src/render/services/test2/Test2Service";
import { MainTestService } from "src/main/services";
import { BehaviorSubject } from "rxjs";

@injectable()
class TestService {
  @inject("Test2Service") test2Service: Test2Service;
  @inject("MainTestService", "MAIN_PROCESS") mainTestService: MainTestService;
  $printHistory: BehaviorSubject<string[]> = new BehaviorSubject([]);

  private _constructor() {
    this.test2Service.print("init Test2Service");
    this.mainTestService.$printHistory.subscribe((history) => {
      console.log("main history", history);
    });
  }

  print(content: string) {
    const printHistory = this.$printHistory.getValue();
    printHistory.push(content);
    this.$printHistory.next(printHistory);
    console.log("TestService print: ", content);
    this.mainTestService.print(content);
  }
}

export default TestService;
