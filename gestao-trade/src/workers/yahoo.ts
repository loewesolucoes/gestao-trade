import { GestaoMessage, WorkersActions } from "./common";
import { WorkerDatabaseConnector } from "./db-connector";
import { ParametrosRepository } from "../repositories/parametros";
import moment from "moment";
import { HistoricoAcoes, HistoricoAcoesRepository, IntervaloHistoricoAcoes } from "../repositories/historico-acoes";
import { NotificationUtil } from "../utils/notification";
import { TableNames } from "../repositories/default";
import BigNumber from "bignumber.js";

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
  const intervalo = IntervaloHistoricoAcoes.UM_DIA;

  const acoesIntegracao = await acoesQuePrecisamAtualizar(intervalo);

  console.log(acoesIntegracao);


  if (acoesIntegracao.length > 0) {
    console.debug('calling yahoo');

    const periodStart = moment("1900-01-01", 'YYYY-MM-DD');
    const periodEnd = moment(new Date()).add(1, 'day');
    const stockSymbol = 'PETR3';

    const records = await downloadHistoricalDataAndParse(stockSymbol, periodStart, periodEnd, intervalo);

    if (records.length > 0) {
      repository.saveAll(TableNames.HISTORICO_ACOES, records);
    } else console.debug('not needed to call yahoo;')

    console.debug('end calling yahoo');
  } else console.debug('not needed to call yahoo;')


  self.postMessage({ id: data.id, response: { success: true } });
}

interface IntegracaoHistoricoAcao {
  periodStart: moment.Moment
  periodEnd: moment.Moment
  codigoAcao: string
  intervalo: IntervaloHistoricoAcoes
}

async function acoesQuePrecisamAtualizar(intervalo: IntervaloHistoricoAcoes): Promise<IntegracaoHistoricoAcao[]> {
  const TODAY_DATE = new Date();
  const { ultimasAtualizacoes, ativos } = await repository.ultimasAtualizacoesEAtivos(intervalo);

  const dict = ultimasAtualizacoes.reduce((p, n) => { p[n.codigo] = n; return p }, {});

  return ativos.map(x => {
    const historico = dict[x.codigo] as HistoricoAcoes;
    const acaoIntegracao = {
      periodStart: moment("1900-01-01", 'YYYY-MM-DD'),
      periodEnd: moment(new Date()).add(1, 'day'),
      codigoAcao: x?.codigo,
      intervalo: intervalo,
    };

    if (historico != null) {
      acaoIntegracao.periodStart = moment(historico.createdDate);

      if (acaoIntegracao.periodStart.isSame(TODAY_DATE, "day")) {
        // @ts-ignore
        acaoIntegracao.codigoAcao = undefined;
      }
    }

    return acaoIntegracao
  }).filter(x => x.codigoAcao != null)
}

async function downloadHistoricalDataAndParse(stockSymbol: string, periodStart: moment.Moment, periodEnd: moment.Moment, intervalo: IntervaloHistoricoAcoes) {
  const records: HistoricoAcoes[] = [];

  try {
    const rawResponse = await fetch(`https://query1.finance.yahoo.com/v7/finance/download/${stockSymbol}.SA?period1=${periodStart.unix()}&period2=${periodEnd.unix()}&interval=${intervalo}&events=history`);

    if (rawResponse.ok && rawResponse?.body != null) {
      const response = await rawResponse.text();
      const lines = response.split('\n');


      for (let index = 1; index < lines.length; index++) {
        const line = lines[index];

        const cols = line.split(',');

        const rec: HistoricoAcoes = { codigo: stockSymbol } as HistoricoAcoes;

        try {
          rec.date = moment(cols[0], 'YYYY-MM-DD').toDate();
          rec.open = BigNumber(cols[1]);
          rec.high = BigNumber(cols[2]);
          rec.low = BigNumber(cols[3]);
          rec.close = BigNumber(cols[4]);
          rec.adjustedClose = BigNumber(cols[5]);
          rec.volume = BigNumber(cols[6]);
          rec.intervalo = intervalo;

          records.push(rec);
        } catch (ex) {
          console.error('Erro ao fazer parse da linha => ', index, line, ex);
        }
      }
    } else {
      console.error('Yahoo status error', rawResponse);

      NotificationUtil.send('Erro ao integrar com o serviço yahoo');
    }
  } catch (ex) {
    console.error('Enable cors', ex);

    NotificationUtil.send('Você esta sem conexão a internet ou precisa habilitar a extensão <a href="https://webextension.org/listing/access-control.html" target="_blank">Cors Unblock</a> para usar a aplicação')
  }

  return records;
}


console.debug('yahoo-worker end');

export { };