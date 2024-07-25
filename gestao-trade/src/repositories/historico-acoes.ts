import BigNumber from "bignumber.js";
import { DefaultFields, DefaultRepository } from "./default";
import { Acoes } from "./acoes";
import moment from "moment";

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

export interface IntegracaoHistoricoAcao {
  periodStart: moment.Moment
  periodEnd: moment.Moment
  codigoAcao: string
  logoAcao?: string
  idAcao: number
  intervalo: IntervaloHistoricoAcoes
}

export class HistoricoAcoesRepository extends DefaultRepository {
  public readonly HISTORICO_ACOES_MAPPING = { ...this.DEFAULT_MAPPING };

  public async listByCode(codigo: string): Promise<HistoricoAcoes[]> {
    const query = `
    SELECT *
    FROM historico_acoes h
    WHERE h."codigo" = $codigo
    GROUP BY h."codigo", h."date"
    ORDER BY h."date" asc;
    `;

    const result = await this.db.exec(query, { $codigo: codigo });

    const parsed = this.parseSqlResultToObj(result, this.HISTORICO_ACOES_MAPPING);

    return parsed[0] || [];
  }

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

  public async acoesQuePrecisamAtualizar(intervalo: IntervaloHistoricoAcoes): Promise<IntegracaoHistoricoAcao[]> {
    const YESTERDAY_DATE = moment(new Date()).add(-1, 'day');
    const { ultimasAtualizacoes, ativos } = await this.ultimasAtualizacoesEAtivos(intervalo);

    console.debug('ultimasAtualizacoesEAtivos', ultimasAtualizacoes, ativos);

    const dict = ultimasAtualizacoes.reduce((p, n) => { p[n.codigo] = n; return p }, {});

    return ativos.map(x => {
      const historico = dict[x.codigo] as HistoricoAcoes;
      const acaoIntegracao = {
        periodStart: moment("1900-01-01", 'YYYY-MM-DD'),
        periodEnd: moment(new Date()).add(1, 'day'),
        codigoAcao: x.codigo,
        logoAcao: x.logo,
        idAcao: x.id,
        intervalo: intervalo,
      };

      if (historico != null) {
        acaoIntegracao.periodStart = moment(historico.createdDate).add(-1, 'day');

        if (acaoIntegracao.periodStart.isSame(YESTERDAY_DATE, "day")) {
          // @ts-ignore
          acaoIntegracao.codigoAcao = undefined;
        }
      }

      return acaoIntegracao
    }).filter(x => x.codigoAcao != null)
  }
}