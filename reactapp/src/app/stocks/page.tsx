"use client";

import "./styles.scss"
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationControl } from "../components/pagination";
import { TimerUtil } from "../utils/timer";

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

const PAGE_PARAM_NAME = "page";
const SEARCH_PARAM_NAME = "q";

let debounceLoad: any = null;

export default function Home() {
  const [search, setSearch] = useState<string>('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [take, setTake] = useState<number>(25);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(100);
  const [isLoadingMark, setIsLoadingMark] = useState<boolean>(false);
  const [markedStocks, setMarkedStocks] = useState<{ [key: string]: Stock }>({});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  debounceLoad = debounceLoad || TimerUtil.debounce((loadAndSet: any) => loadAndSet(), 500);

  useEffect(() => {
    var page = searchParams.get(PAGE_PARAM_NAME)
    var search = searchParams.get(SEARCH_PARAM_NAME)

    page && setPage(Number(page) || 1);
    search && setSearch(search);
  }, []);

  useEffect(() => debounceLoad(loadAndSet), [take, page, search]);

  function loadAndSet() {
    setSearchParam();

    load();
  }

  function setSearchParam() {
    const params = new URLSearchParams(searchParams);

    params.set(PAGE_PARAM_NAME, `${page}`);
    params.set(SEARCH_PARAM_NAME, `${search}`);

    router.push(`${pathname}?${params.toString()}`);
  }

  async function load() {
    const response = await fetch(`https://localhost:7062/Stock?take=${take}&page=${page}&search=${search}`);
    const json = (await response.json()) as StockResponse;

    setMarkedStocks({});
    setStocks(json.data.stocks);
    setTotal(json.data.total);
  }

  function MarkStock(stock: Stock): void {
    const newMarkeds = { ...markedStocks };

    if (newMarkeds[stock.code] == null)
      newMarkeds[stock.code] = stock;
    else
      delete newMarkeds[stock.code];

    setMarkedStocks(newMarkeds);
  }

  async function toogleMark(markedStocks: { [key: string]: Stock; }) {
    setIsLoadingMark(true);

    let content = {} as any

    try {
      const codes = Object.values(markedStocks).map(s => s.code);

      const rawResponse = await fetch(`https://localhost:7062/Stock/ToggleStockActive`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(codes)
      });

      content = await rawResponse.json();

      await load();
    } catch (ex) {
      console.log("erro ao salvar", ex);
    }

    if (content.success)
      alert('Salvo com sucesso!')
    else
      confirm('Erro ao salvar!')

    setIsLoadingMark(false);
  }

  function onChangeSearch(e: any) {
    setSearch(e?.target?.value);
    setPage(1);
  }

  return (
    <section className="container">
      {isLoadingMark && (<div className="loading">Carregando...</div>)}
      <div className="mark-section">
        <div className="form-group">
          <label htmlFor="buscaAtivo" className="form-label">Buscar ativo:</label>
          <input type="search" id="buscaAtivo" name="buscaAtivo" className="form-control" placeholder="PETR4, AZUL4, etc" value={search} onChange={onChangeSearch} />
        </div>
        <div className="buttons">
          {Object.keys(markedStocks).length > 0 && (
            <>
              <button type="button" className="btn btn-success btn-sm" onClick={() => toogleMark(markedStocks)}>Marcar como ativo(s) / inativo(s)</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMarkedStocks({})}>Limpar seleção</button>
            </>
          )}
        </div>
      </div>
      <div className="cards">
        {stocks.map(s => (
          <button key={s.code} type="button" className={`card ${markedStocks[s.code] ? 'marked' : ''} ${s.active ? 'active' : ''}`.trim()} onClick={() => MarkStock(s)}>
            <img src={s.logo} alt={s.name} />
            <h4>{s.name}</h4>
            <small>{s.code}</small>
            <div className="info">
              {s.sector && (<span>{s.sector}</span>)}
              {s.type && (<span>{s.type}</span>)}
            </div>
          </button>
        ))}
      </div>
      <div className="pagination-section">
        <PaginationControl page={page} total={total} limit={take} ellipsis={10} onChangePage={page => setPage(page)}></PaginationControl>
        <select className="form-select" value={take} onChange={e => setTake(Number(e?.target?.value) || 20)}>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </section >
  )
}
