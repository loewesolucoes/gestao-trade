import { DB_CHANNEL_SEND, GestaoMessage, WorkersActions } from "./common";
import { DBWorkerUtil } from "./db-worker-util";

/* eslint-disable no-restricted-globals */
console.debug('brapi-worker start');

const dbWorker = new DBWorkerUtil('brapi');

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

  const acoesResponse = stocks.map(x => ({
    nome: x.name,
    codigo: x.stock,
    tipo: x.sector != null ? 1 : 4, // TODO: Add enum
    active: true,
    valorDeMercado: x.market_cap,
    logo: x.logo,
    setor: x.sector,
  }))

  const acoes = await dbWorker.exec('select * from acoes');

  console.log(acoes);

  self.postMessage({ id: data.id, response: acoesResponse });
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
