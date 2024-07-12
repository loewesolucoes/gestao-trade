import BigNumber from "bignumber.js";
import { DefaultFields, DefaultRepository, TableNames } from "./default-repository";

export enum StockType {
  COMPANY = 1,
  FII = 2,
  ETFS = 3,
  OTHERS = 4,
}

export interface Acoes extends DefaultFields {
  nome?: string
  codigo: string
  logo?: string
  tipo?: StockType
  active?: boolean
  setor?: string
  valorDeMercado?: BigNumber
}

export class AcoesRepository extends DefaultRepository {
}