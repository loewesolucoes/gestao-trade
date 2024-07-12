import BigNumber from "bignumber.js";
import { Acoes, AcoesRepository, StockType } from "../repositories/acoes";
import { TableNames } from "../repositories/default-repository";
import { GestaoMessage, WorkersActions } from "./common";
import { WorkerDatabase } from "./worker-database";

/* eslint-disable no-restricted-globals */
console.debug('brapi-worker start');

const dbWorker = new WorkerDatabase('brapi');
const repository = new AcoesRepository(dbWorker);

self.onmessage = (event: MessageEvent<GestaoMessage>) => {
  console.debug('brapi.onmessage', event);

  switch (event.data.action) {
    case WorkersActions.LOAD_ALL: {
      loadAll(event.data);
    }
  }
};

async function loadAll(data: GestaoMessage) {
  const res = await fetch('https://brapi.dev/api/quote/list')

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

  const acoesASalvar: Acoes[] = []
  const acoes = await repository.list<Acoes>(TableNames.ACOES);

  const acoesDict = acoesToDict(acoes);

  for (let index = 0; index < acoesReponse.length; index++) {
    const acaoAtual = acoesReponse[index];
    const acaoDoDB = acoesDict[acaoAtual.codigo] || {} as Acoes

    acaoDoDB.active = acaoAtual.active;
    acaoDoDB.codigo = acaoAtual.codigo;
    acaoDoDB.logo = acaoAtual.logo;
    acaoDoDB.nome = acaoAtual.nome;
    acaoDoDB.setor = acaoAtual.setor as any;
    acaoDoDB.tipo = acaoAtual.tipo;
    acaoDoDB.valorDeMercado = acaoAtual.valorDeMercado;

    acoesASalvar.push(acaoDoDB);
  }

  console.log(acoes);

  await repository.saveAll(TableNames.ACOES, acoesASalvar);

  self.postMessage({ id: data.id, response: acoesReponse });
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

