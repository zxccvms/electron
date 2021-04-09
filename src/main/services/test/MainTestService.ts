import { injectable } from "src/utils/injecter";
import { BehaviorSubject } from "rxjs";

@injectable()
class MainTestService {
  $printHistory: BehaviorSubject<string[]> = new BehaviorSubject([]);

  print(content: string) {
    const printHistory = this.$printHistory.getValue();
    printHistory.push(content);
    this.$printHistory.next(printHistory);
    console.log("MainTestService print: ", content);
  }
}

export default MainTestService;
