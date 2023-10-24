import moment from "moment";
import { StockHistory } from "../models";

enum MovementType {
  SUBIDA = "SUBIDA",
  DESCIDA = "DESCIDA"
}

class AnalysisService {
  run(historyOriginal: StockHistory[], initialDate: string, endDate: string): any {
    if (historyOriginal.length === 0) return [];
    // const filteredHistory = historyOriginal.filter(x => moment(x.date).isBetween(initialDate, endDate))
    const toposEFundos = this.detectarToposEFundos(historyOriginal.filter(x => moment(x.date).isBetween(initialDate, endDate)));

    console.log(toposEFundos);
    const toposEFundosComFibo = this.criarFiboEAlvos(toposEFundos);

    console.log(toposEFundosComFibo.filter(x => x.bateuAlvo1));


    return toposEFundosComFibo;
  }

  private criarFiboEAlvos(toposEFundos: any[]) {
    const lastMovement = toposEFundos[toposEFundos.length - 1];
    const lastDay = lastMovement.movements[lastMovement.movements.length - 1];

    return toposEFundos.map(x => {
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

  private detectarToposEFundos(history: StockHistory[]) {
    let movements: any[];

    return history
      .map(x => ({ ...x, type: x.open <= x.close ? MovementType.SUBIDA : MovementType.DESCIDA }))
      .reduce((previous, next) => {
        if (movements != null) {
          const lastMovement = movements[movements.length - 1];

          if (lastMovement?.type != next.type) {
            previous.push({
              movements: movements,
              type: lastMovement.type
            });
            movements = [];
          }
        } else
          movements = [];

        const lastMovementAgain = movements[movements.length - 1];

        if (lastMovementAgain == null || lastMovementAgain.type == next.type)
          movements.push({ type: next.type, min: next.min, max: next.max });

        return previous;
      }, [] as any[]);
  }
}


export const analysisService = new AnalysisService();