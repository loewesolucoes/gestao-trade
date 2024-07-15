import BigNumber from "bignumber.js";
import { DefaultFields, DefaultRepository, MapperTypes, TableNames } from "./default-repository";

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

interface AcoesPaginado {
  acoes: Acoes[]
  total: number
}

export class AcoesRepository extends DefaultRepository {
  public readonly ACOES_MAPPING = { ...this.DEFAULT_MAPPING, tipo: MapperTypes.NUMBER, active: MapperTypes.BOOLEAN }

  public async marcarComoAtivos(acoes: Acoes[]) {
    throw new Error('Method not implemented.');
  }

  public async listPaginado(searchStr: string, page: number, take: number): Promise<AcoesPaginado> {
    const query = `
    SELECT count(1) as total
    FROM acoes a
    WHERE $search is NULL    
      OR a.codigo LIKE $search
      OR a.nome LIKE $search
      OR a.setor LIKE $search
    ORDER BY a."active";
      
    SELECT *
    FROM acoes a
    WHERE $search is NULL    
        OR a.codigo LIKE $search
        OR a.nome LIKE $search
        OR a.setor LIKE $search
    ORDER BY a."active"
    LIMIT $limit OFFSET $offset;
    `;

    const result = await this.db.exec(query, { $search: searchStr == null ? null : `%${searchStr}%`, $offset: (page - 1) * take, $limit: take });

    const parsed = this.parseSqlResultToObj(result, this.ACOES_MAPPING);

    return {
      total: BigNumber(parsed[0][0]?.total).toNumber(),
      acoes: parsed[1] || [],
    }
  }
}