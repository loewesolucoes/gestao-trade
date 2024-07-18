import BigNumber from "bignumber.js";
import { DefaultFields, DefaultRepository } from "./default";
import { Acoes } from "./acoes";

export enum IntervaloHistoricoAcoes {
  UM_MINUTO = '1m',
  CINCO_MINUTOS = '5m',
  UM_DIA = '1d',
}

export interface HistoricoAcoes extends DefaultFields {
  codigo: string;
  date: Date;
  open?: BigNumber;
  high?: BigNumber;
  low?: BigNumber;
  close?: BigNumber;
  adjustedClose?: BigNumber;
  volume?: BigNumber;
  intervalo: IntervaloHistoricoAcoes
}

export class HistoricoAcoesRepository extends DefaultRepository {
  public readonly HISTORICO_ACOES_MAPPING = { ...this.DEFAULT_MAPPING };

  public async ultimasAtualizacoesEAtivos(intervalo: IntervaloHistoricoAcoes): Promise<{ ultimasAtualizacoes: HistoricoAcoes[], ativos: Acoes[] }> {
    const query = `
    SELECT *
    FROM acoes a
    WHERE a."active" = 1;

    SELECT h.*, MAX(h.date) AS date
    FROM acoes a
    JOIN historico_acoes h
      ON a.codigo = h.codigo
    WHERE a."active" = 1
      AND h."intervalo" = $intervalo
    GROUP BY h.codigo;
    `;

    const result = await this.db.exec(query, { $intervalo: intervalo });

    const parsed = this.parseSqlResultToObj(result, this.HISTORICO_ACOES_MAPPING);

    return {
      ativos: parsed[0] || [],
      ultimasAtualizacoes: parsed[1] || [],
    };
  }
}