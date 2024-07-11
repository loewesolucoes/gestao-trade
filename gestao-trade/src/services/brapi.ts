import { WorkersActions } from "../workers/common";
import { WorkerService } from "./worker";

class BrapiService extends WorkerService {
  constructor() {
    super(new Worker(new URL("../workers/brapi.ts", import.meta.url)));
  }

  public async loadAll() {
    const response = await this.postMessageAndReceive(WorkersActions.LOAD_ALL)

    console.log(response);
  }
}

export const brapiService = new BrapiService();