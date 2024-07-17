import { GestaoMessage, WorkersActions } from "./common";
import { WorkerDatabaseConnector } from "./db-connector";
import { ParametrosRepository } from "../repositories/parametros";
import moment from "moment";
import { HistoricoAcoesRepository } from "../repositories/historico-acoes";
import { NotificationUtil } from "../utils/notification";

/* eslint-disable no-restricted-globals */
console.debug('yahoo-worker start');

const YAHOO_LAST_UPDATE_KEY = 'YAHOO_LAST_UPDATE';
const dbWorker = new WorkerDatabaseConnector(`yahoo`);
const repository = new HistoricoAcoesRepository(dbWorker);
const paramsRepository = new ParametrosRepository(dbWorker);

self.onmessage = (event: MessageEvent<GestaoMessage>) => {
  console.debug('yahoo.onmessage', event);

  switch (event.data.action) {
    case WorkersActions.LOAD_ALL: {
      loadAll(event.data);
    }
  }
};

async function loadAll(data: GestaoMessage) {
  const lastUpdateParam = await paramsRepository.getByKey(YAHOO_LAST_UPDATE_KEY)
  const lastUpdate = moment(lastUpdateParam?.valor);
  const passou14Dias = moment(new Date()).add(-14, "days").isSameOrAfter(lastUpdate);

  if (true) {
    console.debug('calling yahoo');

    try {
      const rawResponse = await fetch('https://query1.finance.yahoo.com/v7/finance/download/PETR3.SA?period1=-2208988800&period2=1720569600&interval=1d&events=history');

      const response = await rawResponse.text();

      console.log(response);
    } catch (ex) {
      console.error('Enable cors', ex);

      NotificationUtil.send('Você esta sem conexão a internet ou precisa habilitar a extensão <a href="https://webextension.org/listing/access-control.html" target="_blank">Cors Unblock</a> para usar a aplicação')
    }

    console.debug('end calling yahoo');
  } else console.debug('not needed to call yahoo;')


  self.postMessage({ id: data.id, response: { success: true } });
}


console.debug('yahoo-worker end');

export { };