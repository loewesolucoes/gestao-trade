import { WorkersActions } from "../workers/common";
import { WorkerService } from "./worker";

export class YahooService extends WorkerService {
  constructor() {
    super(new Worker(new URL("../workers/yahoo.ts", import.meta.url)));
  }

  public async loadAll() {
    const response = await this.postMessageAndReceive(WorkersActions.LOAD_ALL)

    console.log(response);
  }
}