"use client";

import Image from 'next/image'
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
    <section className="relative flex w-full flex-wrap">
      {stocks.map(s => (
        <div className="max-w-[250px] rounded overflow-hidden shadow-lg" key={s.code}>
          <img className="w-full" src={s.logo} alt={s.name} />
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">{s.name}</div>
          </div>
          <div className="px-6 pt-4 pb-2">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{s.sector}</span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{s.type}</span>
          </div>
        </div>
      ))}
    </section>
  )
}
