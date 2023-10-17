"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';
import { ChartComponent } from './components/chart';
import { ChartIntraday, Stock, StockHistoryResponse, StockSearchResponse } from "./models";
import { StockCard } from './components/stock-card/stock-card';
import moment from "moment";

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>();
  const [currentStock, setCurrentStock] = useState<string>();
  const [history, setHistory] = useState<ChartIntraday[]>();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [currentStock]);

  async function load() {
    const response = await fetch(`https://localhost:7062/stock/actives`);
    const json = (await response.json()) as StockSearchResponse;

    setStocks(json.data.stocks);
  }

  async function loadHistory() {
    if (currentStock == null) return;

    const response = await fetch(`https://localhost:7062/stock/history?stockId=${currentStock}`);
    const json = (await response.json()) as StockHistoryResponse;

    setHistory(json.data.map(x => ({
      time: moment(x.date).format('YYYY-MM-DD'),
      open: x.open,
      close: x.close,
      high: x.max,
      low: x.min,
    })));
  }

  return (
    <section className='container'>
      {stocks == null ? <div className="alert alert-info">Carregando ações ativas...</div>
        : (
          <div className="stocks">
            {stocks.map(x => (
              <StockCard key={x.code} stock={x} isActive={x.code === currentStock} onClick={s => setCurrentStock(s.code)} />
            ))}
          </div>
        )
      }
      {currentStock == null ? <div className="alert alert-warning">Escolha uma ação para analisar</div>
        : (
          history == null ? <div className="alert alert-info">Carregando historico...</div>
            : <ChartComponent className="chart container-sm" data={history}></ChartComponent>
        )
      }
    </section>
  )
}
