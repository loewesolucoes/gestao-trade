import moment from "moment";
import { NotificationUtil } from "../utils/notification";
import { WorkersActions } from "../workers/common";
import { WorkerService } from "./worker";

export class YahooService extends WorkerService {
  constructor() {
    super(new Worker(new URL("../workers/yahoo.ts", import.meta.url)));
  }

  public async loadAll() {
    NotificationUtil.send(`Inicio da integração do YAHOO.`);
    const startTime = Date.now();
    const response = await this.postMessageAndReceive(WorkersActions.LOAD_ALL)

    const endTime = Date.now();
    console.debug('FIM DA INTEGRAÇÃO DO YAHOO.', response);
    NotificationUtil.send(`Fim da integração do YAHOO em ${moment.duration(endTime - startTime, 'milliseconds').humanize()}.`);
  }
}