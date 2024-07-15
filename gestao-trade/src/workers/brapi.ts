import BigNumber from "bignumber.js";
import { Acoes, AcoesRepository, StockType } from "../repositories/acoes";
import { TableNames } from "../repositories/default-repository";
import { GestaoMessage, WorkersActions } from "./common";
import { WorkerDatabase } from "./worker-database";
import { ParametrosRepository } from "../repositories/parametros";
import moment from "moment";

/* eslint-disable no-restricted-globals */
console.debug('brapi-worker start');

const BRAPI_LAST_UPDATE_KEY = 'BRAPI_LAST_UPDATE';
const dbWorker = new WorkerDatabase(`brapi`);
const repository = new AcoesRepository(dbWorker);
const paramsRepository = new ParametrosRepository(dbWorker);

self.onmessage = (event: MessageEvent<GestaoMessage>) => {
  console.debug('brapi.onmessage', event);

  switch (event.data.action) {
    case WorkersActions.LOAD_ALL: {
      loadAll(event.data);
    }
  }
};

async function loadAll(data: GestaoMessage) {
  const lastUpdateParam = await paramsRepository.getByKey(BRAPI_LAST_UPDATE_KEY)
  const lastUpdate = moment(lastUpdateParam?.valor);
  const passou14Dias = moment(new Date()).add(-14, "days").isSameOrAfter(lastUpdate);

  if (lastUpdateParam == null || passou14Dias) {
    console.debug('calling brapi');

    await loadAllAndSave();
    await paramsRepository.set(BRAPI_LAST_UPDATE_KEY, moment(new Date()).toISOString());

    console.debug('end calling brapi');
  } else console.debug('not needed to call brapi;')


  self.postMessage({ id: data.id, response: { success: true } });
}

async function loadAllAndSave() {
  const res = await fetch('https://brapi.dev/api/quote/list');

  const { stocks } = (await res.json() as BrapiResponse);

  const acoesReponse = stocks.map(x => ({
    nome: x.name,
    codigo: x.stock,
    tipo: x.sector != null ? StockType.COMPANY : StockType.OTHERS, // TODO: Add enum
    active: true,
    valorDeMercado: new BigNumber(x.market_cap as any),
    logo: x.logo,
    setor: x.sector,
  }));

  const acoesASalvar: Acoes[] = [];
  const acoes = await repository.list<Acoes>(TableNames.ACOES);

  const acoesDict = acoesToDict(acoes);

  for (let index = 0; index < acoesReponse.length; index++) {
    const acaoAtual = acoesReponse[index];
    const acaoDoDB = acoesDict[acaoAtual.codigo];
    const acaoDoDBOrNew = acaoDoDB || {} as Acoes;

    acaoDoDBOrNew.active = acaoAtual.active;
    acaoDoDBOrNew.codigo = acaoAtual.codigo;
    acaoDoDBOrNew.logo = acaoAtual.logo;
    acaoDoDBOrNew.nome = acaoAtual.nome;
    acaoDoDBOrNew.setor = acaoAtual.setor as any;
    acaoDoDBOrNew.tipo = acaoAtual.tipo;
    acaoDoDBOrNew.valorDeMercado = acaoAtual.valorDeMercado;

    if (acaoDoDB == null)
      acaoDoDBOrNew.active = false;

    acoesASalvar.push(acaoDoDBOrNew);
  }

  await repository.saveAll(TableNames.ACOES, acoesASalvar);
  return acoesReponse;
}

function acoesToDict(acoesReponse: Acoes[]): { [key: string]: Acoes } {
  return acoesReponse.reduce((previous, next) => {
    previous[next.codigo] = next;

    return previous;
  }, {});
}

console.debug('brapi-worker end');

export { };

export interface BrapiResponse {
  indexes: BrapiIndex[];
  stocks: BrapiStock[];
  availableSectors: BrapiSector[];
  availableStockTypes: BrapiType[];
}

export enum BrapiSector {
  CommercialServices = "Commercial Services",
  Communications = "Communications",
  ConsumerDurables = "Consumer Durables",
  ConsumerNonDurables = "Consumer Non-Durables",
  ConsumerServices = "Consumer Services",
  DistributionServices = "Distribution Services",
  ElectronicTechnology = "Electronic Technology",
  EnergyMinerals = "Energy Minerals",
  Finance = "Finance",
  HealthServices = "Health Services",
  HealthTechnology = "Health Technology",
  IndustrialServices = "Industrial Services",
  Miscellaneous = "Miscellaneous",
  NonEnergyMinerals = "Non-Energy Minerals",
  ProcessIndustries = "Process Industries",
  ProducerManufacturing = "Producer Manufacturing",
  RetailTrade = "Retail Trade",
  TechnologyServices = "Technology Services",
  Transportation = "Transportation",
  Utilities = "Utilities",
}

export enum BrapiType {
  Bdr = "bdr",
  Fund = "fund",
  Stock = "stock",
}

export interface BrapiIndex {
  stock: string;
  name: string;
}

export interface BrapiStock {
  stock: string;
  name: string;
  close: number;
  change: number;
  volume: number;
  market_cap: number | null;
  logo: string;
  sector: BrapiSector | null;
  type: BrapiType;
}

