import moment from "moment";
import { StockHistory } from "../models";

enum MovementType {
  SUBIDA = "SUBIDA",
  DESCIDA = "DESCIDA"
}

enum TopBottomType {
  TOPO = "TOPO",
  FUNDO = "FUNDO"
}

class AnalysisService {
  run(historyOriginal: StockHistory[], initialDate: string, endDate: string): any {
    if (historyOriginal.length === 0) return [];
    const filteredHistory = historyOriginal.filter(x => moment(x.date).isBetween(initialDate, endDate));

    const toposEFundos = this.detectar_topos_e_fundos(filteredHistory, 2);
    console.log(toposEFundos);
    const movements = this.parseToMovements(filteredHistory);
    console.log(movements);
    const movementsWithFibo = this.criarFiboEAlvos(movements);

    console.log(movementsWithFibo.filter(x => x.bateuAlvo1).map(x => ({ ...x })));

    return movementsWithFibo;
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

  private parseToMovements(history: StockHistory[]) {
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

  private toposEFundos(history: StockHistory[], periodos = 2) {
    const first = history[0];
    const second = history[1];
    const topOrBottom = { ...first, type: first.max >= second.max ? TopBottomType.TOPO : TopBottomType.FUNDO, confirmed: true, index: 0 };

    history
      .slice(1)
      .reduce((previous, next, index) => {
        const last = previous[previous.length - 1];

        if (!last.confirmed) {
          if (last.type == TopBottomType.TOPO && last.max >= next.max && last.index - index > periodos)
            last.confirmed = true;

          if (last.type == TopBottomType.FUNDO && last.min <= next.min && last.index - index > periodos)
            last.confirmed = true;
        } else {

        }



        return previous;
      }, [topOrBottom]);
  }

  private detectar_topos_e_fundos(dados_do_ativo: StockHistory[], periodos: number) {
    let topos = [];
    let fundos = [];

    const dadosTopos = dados_do_ativo.map(x => x.max);
    const dadosFundos = dados_do_ativo.map(x => x.min);

    for (let i = 1; i < dados_do_ativo.length - 1; i++) {
      if (dadosTopos[i] > Math.max(...dadosTopos.slice(i - periodos, i)) && dadosTopos[i] > Math.max(...dadosTopos.slice(i + 1, i + periodos + 1))) {
        topos.push(dados_do_ativo[i]);
      } else if (dadosFundos[i] < Math.min(...dadosFundos.slice(i - periodos, i)) && dadosFundos[i] < Math.min(...dadosFundos.slice(i + 1, i + periodos + 1))) {
        fundos.push(dados_do_ativo[i]);
      }
    }

    return { topos, fundos };
  }
}


export const analysisService = new AnalysisService();