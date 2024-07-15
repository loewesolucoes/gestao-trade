import BigNumber from "bignumber.js";
import { DefaultFields, DefaultRepository, MapperTypes, TableNames } from "./default-repository";

export enum StockType {
  COMPANY = 1,
  FII = 2,
  ETFS = 3,
  OTHERS = 4,
}

export interface Acoes extends DefaultFields {
  code: any;
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
    for (let index = 0; index < acoes.length; index++) {
      const element = acoes[index];

      element.active = !element.active;
    }

    await this.saveAll(TableNames.ACOES, acoes);
  }

  public async listPaginado(searchStr: string, page: number, take: number): Promise<AcoesPaginado> {
    const query = `
    SELECT count(1) as total
    FROM acoes a
    WHERE $search is NULL    
      OR a.codigo LIKE $search
      OR a.nome LIKE $search
      OR a.setor LIKE $search;
      
    SELECT *
    FROM acoes a
    WHERE $search is NULL    
        OR a.codigo LIKE $search
        OR a.nome LIKE $search
        OR a.setor LIKE $search
    ORDER BY a."active" desc
    LIMIT $limit OFFSET $offset;
    `;

    const result = await this.db.exec(query, { $search: searchStr == null ? null : `%${searchStr}%`, $offset: (page - 1) * take, $limit: take });

    const parsed = this.parseSqlResultToObj(result, this.ACOES_MAPPING);

    return {
      total: BigNumber(parsed[0][0]?.total).toNumber(),
      acoes: parsed[1] || [],
    }
  }

  public async listActives(): Promise<Acoes[]> {
    const query = `      
    SELECT *
    FROM acoes a
    WHERE a."active" = 1
    `;

    const result = await this.db.exec(query);

    const parsed = this.parseSqlResultToObj(result, this.ACOES_MAPPING);

    return parsed[0] || []
  }
}