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

/**
 * 
 * Date,Open,High,Low,Close,Adj Close,Volume
2000-01-03,4.593750,4.593750,4.593750,4.593750,1.369073,3998720000
2000-01-04,4.335937,4.335937,4.335937,4.335937,1.292237,3098880000
2000-01-05,4.394531,4.394531,4.394531,4.394531,1.309699,6645760000
2000-01-06,4.359375,4.359375,4.359375,4.359375,1.299222,3303680000
 */

async function loadAll(data: GestaoMessage) {
  const lastUpdateParam = await paramsRepository.getByKey(YAHOO_LAST_UPDATE_KEY)
  const lastUpdate = moment(lastUpdateParam?.valor);
  const passou14Dias = moment(new Date()).add(-14, "days").isSameOrAfter(lastUpdate);

  if (true) {
    console.debug('calling yahoo');

    try {
      const rawResponse = await fetch('https://query1.finance.yahoo.com/v7/finance/download/PETR3.SA?period1=-2208988800&period2=1720569600&interval=1d&events=history');

      if (rawResponse.ok && rawResponse?.body != null) {
        const response = await rawResponse.text()
        const lines = response.split('\n')

        for (let index = 0; index < lines.length; index++) {
          const element = lines[index];
          //
        }
      } else {
        console.error('Yahoo status error', rawResponse);

        NotificationUtil.send('Erro ao integrar com o serviço yahoo');
      }

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