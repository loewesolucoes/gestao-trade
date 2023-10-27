import { Interval, StockHistory } from '@/app/models';
import { analysisService } from '../analysis'

const intraday: StockHistory[] = [
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 80,
    min: 60,
    open: 70,
    close: 50,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 60,
    min: 20,
    open: 55,
    close: 25,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 55,
    min: 20,
    open: 25,
    close: 45,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 100,
    min: 60,
    open: 65,
    close: 90,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 110,
    min: 80,
    open: 100,
    close: 75,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 80,
    min: 65,
    open: 75,
    close: 70,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 75,
    min: 50,
    open: 70,
    close: 60,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 74,
    min: 45,
    open: 65,
    close: 70,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 110,
    min: 65,
    open: 70,
    close: 80,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 160,
    min: 70,
    open: 80,
    close: 150,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 150,
    min: 130,
    open: 140,
    close: 145,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 160,
    min: 140,
    open: 150,
    close: 140,
  },
  {
    adjustedClose: 1, id: 1, volume: 10000, date: new Date(), interval: Interval.Daily, stockId: "BBAS3",
    max: 170,
    min: 140,
    open: 140,
    close: 160,
  },
];

describe("analysis service", () => {

  it("find tops and bottoms", () => {
    // check if all components are rendered

    const result = (analysisService as any).detectar_topos_e_fundos(intraday, 2)
    expect(result).not.toBeNull();
    expect(result.topos).toHaveLength(3);
    expect(result.fundos).toHaveLength(3);
  });
});