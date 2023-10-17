"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';
import { ChartComponent } from './chart';
import { Stock, StockHistoryResponse, StockSearchResponse } from "./models";
import { StockCard } from './components/stock-card/stock-card';

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [currentStock, setCurrentStock] = useState<string>();
  const [history, setHistory] = useState<ChartIntraday[]>([]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [currentStock]);

  async function load() {
    const response = await fetch(`https://localhost:7062/stock/actives`);
    const json = (await response.json()) as StockSearchResponse;
    const first = json.data.stocks[0];

    setStocks(json.data.stocks);

    setCurrentStock(first.code);
  }

  async function loadHistory() {
    if (currentStock == null) return;

    const response = await fetch(`https://localhost:7062/stock/history?stockId=${currentStock}`);
    const json = (await response.json()) as StockHistoryResponse;

    setHistory(json.data.map(x => ({
      time: x.date,
      open: x.open,
      close: x.close,
      high: x.max,
      low: x.min,
    })));
  }

  return (
    <section className='container'>
      <div className="stocks">
        {stocks.map(x => (
          <StockCard key={x.code} stock={x} isActive={x.code === currentStock} onClick={s => setCurrentStock(s.code)} />
        ))}
      </div>
      <ChartComponent className="chart" data={history}></ChartComponent>
    </section>
  )
}
