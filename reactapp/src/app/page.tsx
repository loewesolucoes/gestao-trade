"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';
import { ChartComponent } from './components/chart';
import { ChartIntraday, Stock, StockHistoryResponse, StockSearchResponse } from "./models";
import { StockCard } from './components/stock-card/stock-card';
import moment from "moment";

export default function Home() {
  const [initialDate, setInitialDate] = useState<string>(moment().add(-1, 'months').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'));
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
      <div className="configs">
        <div className="form-group">
          <label htmlFor="dataInicio" className="form-label">Data inicio:</label>
          <input type="date" id="dataInicio" name="dataInicio" className="form-control" value={initialDate} onChange={e => setInitialDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="dataFim" className="form-label">Data fim:</label>
          <input type="date" id="dataFim" name="dataFim" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>
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
            : <ChartComponent className="chart container-sm" data={history} visibleFrom={initialDate} visibleTo={endDate}></ChartComponent>
        )
      }
    </section>
  )
}
