import moment from "moment";
import { StockHistory } from "../models";

export enum MovementType {
  SUBIDA = "SUBIDA",
  DESCIDA = "DESCIDA",
  UNCOMPLETED = "UNCOMPLETED",
}

export enum TopBottomType {
  TOPO = "TOPO",
  FUNDO = "FUNDO"
}

class AnalysisService {
  run(historyOriginal: StockHistory[], initialDate: string, endDate: string): any {
    if (historyOriginal.length === 0) return [];
    const filteredHistory = historyOriginal.filter(x => moment(x.date).isBetween(initialDate, endDate));

    const toposEFundos = this.toposEFundos(filteredHistory, 2);
    const movements = this.parseToMovements(toposEFundos);
    console.log(movements);
    const movementsWithFibo = this.criarFiboEAlvos(movements);

    return movementsWithFibo;
  }

  private criarFiboEAlvos(toposEFundos: any[]) {
    const lastDay = toposEFundos[toposEFundos.length - 1]?.data;

    return toposEFundos
      .map(x => {
        const atual = { ...x };
        const first = atual.movements[0];
        const last = atual.movements[atual.movements.length - 1];

        if (atual.type === MovementType.DESCIDA) {
          atual.fibo0 = first.max; // z
          atual.fibo382 = first.max - .382 * (last.max - first.min);
          atual.fibo618 = first.max - .618 * (last.max - first.min);
          atual.fibo50 = first.max - .50 * (last.max - first.min);
          atual.fibo1000 = last.min; // y
          atual.alvo1 = ((atual.fibo618 - atual.fibo0) / .618) + atual.fibo618; // y2 = ((x - z) / 0,618) + x
          atual.bateuAlvo1 = lastDay.min <= atual.alvo1;
          atual.alvo2 = ((atual.fibo50 - atual.fibo0) / .5) + atual.fibo1000; // y3 = ((x - z) / 0,5) + y
          atual.bateuAlvo2 = lastDay.min <= atual.alvo2;
          atual.alvo3 = ((atual.fibo382 - atual.fibo0) / .382) + atual.alvo1; // y4 = ((x - z) / 0,382) + y2
          atual.bateuAlvo3 = lastDay.min <= atual.alvo3;
        } else {
          atual.fibo0 = first.min; // z
          atual.fibo382 = first.min + .382 * (last.max - first.min);
          atual.fibo618 = first.min + .618 * (last.max - first.min);
          atual.fibo50 = first.min + .50 * (last.max - first.min);
          atual.fibo1000 = last.max; // y
          atual.alvo1 = ((atual.fibo618 - atual.fibo0) / .618) + atual.fibo618; // y2 = ((x - z) / 0,618) + x
          atual.bateuAlvo1 = lastDay.max >= atual.alvo1;
          atual.alvo2 = ((atual.fibo50 - atual.fibo0) / .5) + atual.fibo1000; // y3 = ((x - z) / 0,5) + y
          atual.bateuAlvo2 = lastDay.max >= atual.alvo2;
          atual.alvo3 = ((atual.fibo382 - atual.fibo0) / .382) + atual.alvo1; // y4 = ((x - z) / 0,382) + y2
          atual.bateuAlvo3 = lastDay.max >= atual.alvo3;
        }

        return atual;
      });
  }

  private parseToMovements(history: any[]) {
    return history
      .reduce(((previous, next) => {
        const last = previous[previous.length - 1];

        if (next.type === TopBottomType.FUNDO || last == null) {
          previous.push({
            ...next,
            movements: [next.data],
            movementType: MovementType.UNCOMPLETED,
            type: undefined,
          });
        } else if (next.type === TopBottomType.TOPO) {
          previous[previous.length - 1] = {
            ...last,
            movements: [last.data, next.data],
            movementType: last.data.min <= next.data.max ? MovementType.SUBIDA : MovementType.DESCIDA,
            type: undefined,
          }
        }

        return previous;
      }), [] as any[]);
  }

  private toposEFundos(data: StockHistory[], order: number) {
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

  private extremos(data: StockHistory[], order: number) {
    const topos = []
    const fundos = []

    for (let i = 0; i < data.length; i++) {
      if (this.ehTopo(data, i, order)) {
        topos.push({
          index: i,
          order: i - order,
          date: data[i].date,
          data: data[i],
          type: TopBottomType.TOPO,
        })
      }

      if (this.ehFundo(data, i, order)) {
        fundos.push({
          index: i,
          order: i - order,
          date: data[i].date,
          data: data[i],
          type: TopBottomType.FUNDO,
        })
      }
    }

    return { topos, fundos }
  }

  // tks https://www.youtube.com/watch?v=X31hyMhB-3s
  // Checks if there is a local top detected at curr index
  private ehTopo(data: StockHistory[], index: number, order: number) {
    var top = true
    var currentMax = data[index].max

    for (let orderIndex = 1; orderIndex < order + 1; orderIndex++) {
      const nextMax = data[index + orderIndex]?.max;
      const proximoEhMaior = currentMax <= nextMax;

      if (nextMax == null || proximoEhMaior) {
        top = false
        break;
      }
    }

    return top
  }

  private ehFundo(data: StockHistory[], index: number, order: number) {
    var bottom = true
    var currentMin = data[index].min

    for (let orderIndex = 1; orderIndex < order + 1; orderIndex++) {
      const nextMin = data[index + orderIndex]?.min;
      const proximoEhMenor = currentMin >= nextMin;

      if (nextMin == null || proximoEhMenor) {
        bottom = false
        break;
      }
    }

    return bottom
  }

}


export const analysisService = new AnalysisService();