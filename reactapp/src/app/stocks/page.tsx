"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationControl } from "../pagination";

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
  const [take, setTake] = useState<number>(25);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(100);
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()!

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setSearchParam();

    load();
  }, [take, page]);

  function setSearchParam() {
    const params = new URLSearchParams(searchParams);

    params.set("page", `${page}`);
    params.set("take", `${take}`);

    router.push(`${pathname}?${params.toString()}`);
  }

  async function load() {
    const response = await fetch(`https://localhost:7062/Stock?take=${take}&page=${page}`);
    const json = (await response.json()) as StockResponse;

    setStocks(json.data.stocks);
    setTotal(json.data.total);
  }

  return (
    <section className="container">
      <PaginationControl page={page} total={total} limit={take} ellipsis={10} onChangePage={page => setPage(page)}></PaginationControl>
      <div className="cards">
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
      </div>
      <select value={take} onChange={e => setTake(Number(e?.target?.value) || 20)}>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </section >
  )
}
