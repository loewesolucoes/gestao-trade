import moment from "moment";
import { StockHistory } from "../models";

enum MovementType {
  SUBIDA = "SUBIDA",
  DESCIDA = "DESCIDA"
}

class AnalysisService {
  run(historyOriginal: StockHistory[], initialDate: string, endDate: string): any {
    const filteredHistory = historyOriginal.filter(x => moment(x.date).isBetween(initialDate, endDate))
    const analiseFinal = [] as any[];
    const analise = filteredHistory.map(x => ({ ...x, type: x.open <= x.close ? MovementType.SUBIDA : MovementType.DESCIDA }));
    let temp: any[];

    analise.forEach(x => {
      if (temp != null) {
        const lastTemp = temp[temp.length - 1];

        if (lastTemp?.type != x.type) {
          analiseFinal.push({
            movements: temp,
            type: lastTemp.type
          });
          temp = [];
        }
      } else temp = []

      const lastTempAgain = temp[temp.length - 1];

      if (lastTempAgain == null || lastTempAgain.type == x.type)
        temp.push({ type: x.type, min: x.min, max: x.max });
    })

    analiseFinal.forEach(x => {
      const first = x.movements[0];
      const last = x.movements[x.movements.length - 1];

      x.fibo100 = last.max;
      x.fibo0 = first.min;
      x.fibo618 = first.min + .618 * (last.max - first.min);
      x.fibo382 = first.min + .382 * (last.max - first.min);
      x.fibo50 = first.min + .50 * (last.max - first.min);
    })

    console.log(analiseFinal);

    return analiseFinal;
  }
}


export const analysisService = new AnalysisService();