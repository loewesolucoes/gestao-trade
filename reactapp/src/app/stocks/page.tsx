"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';

interface StockResponse { success: boolean, stocks: Stock[] }
interface Stock {
  id: string
  code: string
  name: string
  active: boolean
  type: string
  logo: string
  marketCap?: number
  sector?: string
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    newFunction();
  }, []);

  async function newFunction() {
    const response = await fetch('https://localhost:7062/Stock');
    const json = (await response.json()) as StockResponse;

    setStocks(json.stocks);
  }

  return (
    <section>
      {stocks.map(s => (
        <div key={s.code} className="card">
          <img src={s.logo} alt={s.name} />
          <h5>{s.name}</h5>
          <div className="info">
            {s.sector && (<span>{s.sector}</span>)}
            {s.type && (<span>{s.type}</span>)}
          </div>
        </div>
      ))}
      <select>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </section >
  )
}
