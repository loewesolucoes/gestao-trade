"use client";

import Image from 'next/image'
import { ChartComponent } from './chart';
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-start font-mono text-sm lg:flex">
        <a
          className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={24}
            priority
          />
        </a>
        <p className="logo absolute left-0 top-0 flex w-full justify-center border-b lg:static lg:w-auto lg:rounded-xl">
          Dashboard trader
        </p>
      </div>

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


      <ChartComponent className="relative flex w-full"></ChartComponent>
    </main>
  )
}
