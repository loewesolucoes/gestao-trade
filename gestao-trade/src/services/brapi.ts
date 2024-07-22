import moment from "moment";
import { NotificationUtil } from "../utils/notification";
import { WorkersActions } from "../workers/common";
import { WorkerService } from "./worker";

export class BrapiService extends WorkerService {
  constructor() {
    super(new Worker(new URL("../workers/brapi.ts", import.meta.url)));
  }

  public async loadAll() {
    const startTime = Date.now();
    const response = await this.postMessageAndReceive(WorkersActions.LOAD_ALL)

    const endTime = Date.now();
    console.debug('FIM DA INTEGRAÇÃO DO BRAPI.', response);
    NotificationUtil.send(`Fim da integração do BRAPI em ${moment.duration(endTime - startTime, 'milliseconds').humanize()}.`);
  }
}