import moment from "moment";
import { HistoricoAcoes } from "../repositories/historico-acoes";
import BigNumber from "bignumber.js";

export enum MovementType {
  SUBIDA = "SUBIDA",
  DESCIDA = "DESCIDA",
  UNCOMPLETED = "UNCOMPLETED",
}

export enum TopBottomType {
  TOPO = "TOPO",
  FUNDO = "FUNDO"
}

export enum PivosType {
  ALTA = "ALTA",
  BAIXA = "BAIXA"
}

interface FiboEAlvos {
  movements: HistoricoAcoes[]
  fibo0?: BigNumber
  fibo382?: BigNumber
  fibo618?: BigNumber
  fibo50?: BigNumber
  fibo1000?: BigNumber
  alvo1?: BigNumber
  bateuAlvo1?: boolean
  alvo2?: BigNumber
  bateuAlvo2?: boolean
  alvo3?: BigNumber
  bateuAlvo3?: boolean
}

interface ExtremosToposEFundos extends HistoricoAcoes {
  index: number
  order: number
  data: ExtremosData
  type: TopBottomType
}

interface ExtremosData extends HistoricoAcoes {
  type: TopBottomType
}

class AnalysisService {
  public run(historyOriginal: HistoricoAcoes[], initialDate: string, endDate: string): any {
    if (historyOriginal.length === 0) return [];
    const filteredHistory = historyOriginal.filter(x => moment(x.date).isBetween(initialDate, endDate));

    const toposEFundos = this.toposEFundos(filteredHistory, 2);
    const movementsAlta = this.parseToMovementsTresPontos(toposEFundos, PivosType.ALTA);
    const movementsBaixa = this.parseToMovementsTresPontos(toposEFundos, PivosType.BAIXA);
    console.log(JSON.stringify(movementsAlta.concat(movementsBaixa)));
    const movementsAltaWithFibo = this.criarFiboEAlvos(movementsAlta);
    const movementsBaixaWithFibo = this.criarFiboEAlvos(movementsBaixa);

    return movementsAltaWithFibo.concat(movementsBaixaWithFibo);
  }

  private criarFiboEAlvos(toposEFundos: any[]) {
    const lastMovements = toposEFundos[toposEFundos.length - 1]?.movements || [];
    const lastDay = lastMovements[lastMovements.length - 1];

    return toposEFundos
      .map(x => {
        const atual = { ...x };
        const first = atual.movements[0];
        const last = atual.movements[atual.movements.length - 1];

        if (atual.type === MovementType.DESCIDA) {
          atual.fibo0 = first.high; // z
          atual.fibo382 = first.high - .382 * (last.high - first.low);
          atual.fibo618 = first.high - .618 * (last.high - first.low);
          atual.fibo50 = first.high - .50 * (last.high - first.low);
          atual.fibo1000 = last.low; // y
          atual.alvo1 = ((atual.fibo618 - atual.fibo0) / .618) + atual.fibo618; // y2 = ((x - z) / 0,618) + x
          atual.bateuAlvo1 = lastDay.low <= atual.alvo1;
          atual.alvo2 = ((atual.fibo50 - atual.fibo0) / .5) + atual.fibo1000; // y3 = ((x - z) / 0,5) + y
          atual.bateuAlvo2 = lastDay.low <= atual.alvo2;
          atual.alvo3 = ((atual.fibo382 - atual.fibo0) / .382) + atual.alvo1; // y4 = ((x - z) / 0,382) + y2
          atual.bateuAlvo3 = lastDay.low <= atual.alvo3;
        } else {
          atual.fibo0 = first.low; // z
          atual.fibo382 = first.low + .382 * (last.high - first.low);
          atual.fibo618 = first.low + .618 * (last.high - first.low);
          atual.fibo50 = first.low + .50 * (last.high - first.low);
          atual.fibo1000 = last.high; // y
          atual.alvo1 = ((atual.fibo618 - atual.fibo0) / .618) + atual.fibo618; // y2 = ((x - z) / 0,618) + x
          atual.bateuAlvo1 = lastDay.high >= atual.alvo1;
          atual.alvo2 = ((atual.fibo50 - atual.fibo0) / .5) + atual.fibo1000; // y3 = ((x - z) / 0,5) + y
          atual.bateuAlvo2 = lastDay.high >= atual.alvo2;
          atual.alvo3 = ((atual.fibo382 - atual.fibo0) / .382) + atual.alvo1; // y4 = ((x - z) / 0,382) + y2
          atual.bateuAlvo3 = lastDay.high >= atual.alvo3;
        }

        return atual;
      });
  }

  // fazer parse dos movimentos baseado em tres pontos do grafico: FUNDO, TOPO, FUNDO
  // comparar primeiro fundo com o proximo
  // se estiver mais alto, é uma subida
  // se estiver mais baixo é uma descida
  private parseToMovementsTresPontos(history: ExtremosToposEFundos[], pivo: PivosType) {
    return history
      .reduce(((previous, next) => {
        const last = previous[previous.length - 1];

        if (last == null) {
          fillFirstInfo();
        } else if (last.movements.length === 1) {
          last.movements.push(next.data);

          if (previous.length === 1) {
            if (pivo === PivosType.ALTA && next.type == TopBottomType.FUNDO) fillFirstInfo();
            if (pivo === PivosType.BAIXA && next.type == TopBottomType.TOPO) fillFirstInfo();
          }

        } else {
          const firstData = last.movements[0];

          last.movements.push(next.data);

          if (pivo === PivosType.BAIXA)
            last.movementType = firstData.high?.isLessThanOrEqualTo(next.data.high) ? MovementType.SUBIDA : MovementType.DESCIDA;
          else
            last.movementType = firstData.low?.isLessThanOrEqualTo(next.data.low) ? MovementType.SUBIDA : MovementType.DESCIDA;

          fillFirstInfo();
        }

        return previous;

        function fillFirstInfo() {
          previous.push({
            index: next.index,
            order: next.order,
            movements: [next.data],
            movementType: MovementType.UNCOMPLETED,
          });
        }
      }), [] as any[]);
  }

  private parseToMovementsDoisPontos(history: any[]) {
    return history
      .reduce(((previous, next) => {
        const last = previous[previous.length - 1];

        if (last == null) {
          previous.push({
            index: next.index,
            order: next.order,
            movements: [next.data],
            movementType: MovementType.UNCOMPLETED,
          });
        } else {
          const lastData = last.movements[last.movements.length - 1];

          if (lastData.min <= next.data.min) {
            previous.push({
              index: last.index,
              order: last.order,
              movements: [lastData, next.data],
              movementType: MovementType.SUBIDA,
            });
          } else {
            previous.push({
              index: last.index,
              order: last.order,
              movements: [lastData, next.data],
              movementType: MovementType.DESCIDA,
            });
          }
        }

        return previous;
      }), [] as any[]);
  }

  private toposEFundos(data: HistoricoAcoes[], order: number) {
    const extremos = this.extremos(data, order);

    const toposEFundos = extremos.topos.concat(extremos.fundos).sort((x, y) => {
      if (x.index < y.index)
        return -1;

      if (x.index > y.index)
        return 1;

      return 0;
    }) as any[];

    const toposEFundosCompleto = toposEFundos.reduce(((previous, next) => {
      const last = previous[previous.length - 1];

      if (last?.type != next.type)
        previous.push(next);

      return previous;
    }), [] as any[]);

    return toposEFundosCompleto;
  }

  private extremos(data: HistoricoAcoes[], order: number) {
    const topos: ExtremosToposEFundos[] = []
    const fundos: ExtremosToposEFundos[] = []

    for (let i = 0; i < data.length; i++) {
      if (this.ehTopo(data, i, order)) {
        topos.push({
          index: i,
          order: i - order,
          date: data[i].date,
          data: {
            ...data[i],
            type: TopBottomType.TOPO,
          },
          type: TopBottomType.TOPO,
        } as any)
      }

      if (this.ehFundo(data, i, order)) {
        fundos.push({
          index: i,
          order: i - order,
          date: data[i].date,
          data: {
            ...data[i],
            type: TopBottomType.FUNDO,
          },
          type: TopBottomType.FUNDO,
        } as any)
      }
    }

    return { topos, fundos }
  }

  // tks https://www.youtube.com/watch?v=X31hyMhB-3s
  // Checks if there is a local top detected at curr index
  private ehTopo(data: HistoricoAcoes[], index: number, order: number) {
    var top = true
    var currentMax = data[index].high

    for (let orderIndex = 1; orderIndex < order + 1; orderIndex++) {
      const nextMax = data[index + orderIndex]?.high;
      const proximoEhMaior = currentMax?.isLessThanOrEqualTo(nextMax as any);

      if (nextMax == null || proximoEhMaior) {
        top = false
        break;
      }
    }

    return top
  }

  private ehFundo(data: HistoricoAcoes[], index: number, order: number) {
    var bottom = true
    var currentMin = data[index].low

    for (let orderIndex = 1; orderIndex < order + 1; orderIndex++) {
      const nextMin = data[index + orderIndex]?.low;
      const proximoEhMenor = currentMin?.isGreaterThanOrEqualTo(nextMin as any);

      if (nextMin == null || proximoEhMenor) {
        bottom = false
        break;
      }
    }

    return bottom
  }

}


export const analysisService = new AnalysisService();