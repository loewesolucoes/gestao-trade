import { DefaultFields, DefaultRepository } from "./default";


export interface HistoricoAcoes extends DefaultFields {
}

export class HistoricoAcoesRepository extends DefaultRepository {
  public readonly HISTORICO_ACOES_MAPPING = { ...this.DEFAULT_MAPPING }
}