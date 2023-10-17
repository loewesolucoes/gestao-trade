"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';
import { ChartComponent } from './chart';
import { Stock, StockSearchResponse } from "./models";
import { StockCard } from './components/stock-card/stock-card';

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [currentStock, setCurrentStock] = useState<string>();

  useEffect(() => {
    loadAndSet();
  }, []);

  function loadAndSet() {
    load();
  }

  async function load() {
    const response = await fetch(`https://localhost:7062/stock/actives`);
    const json = (await response.json()) as StockSearchResponse;

    setStocks(json.data.stocks);
  }

  return (
    <section className='container'>
      <div className="stocks">
        {stocks.map(x => (
          <StockCard stock={x} isActive={x.code === currentStock} onClick={s => setCurrentStock(s.code)} />
        ))}
      </div>
      <ChartComponent className="chart"></ChartComponent>
    </section>
  )
}
