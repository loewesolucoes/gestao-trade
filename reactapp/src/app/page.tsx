"use client";

import { useEffect, useState } from 'react';
import { ChartComponent } from './chart';

interface StockResponse {
  success: boolean,
  data: { stocks: Stock[], total: number }
}

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
    loadAndSet();
  }, []);

  function loadAndSet() {
    load();
  }

  async function load() {
    const response = await fetch(`https://localhost:7062/stock/actives`);
    const json = (await response.json()) as StockResponse;

    setStocks(json.data.stocks);
  }

  return (
    <ChartComponent className="chart"></ChartComponent>
  )
}
