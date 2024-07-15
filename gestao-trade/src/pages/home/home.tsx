import logo from './logo.svg';
import './home.scss';
import { Layout } from '../../shared/layout';
import { useEffect, useState } from 'react';
import { Acoes } from '../../repositories/acoes';
import { useStorage } from '../../contexts/storage';
import { AcaoCard } from '../acoes/acao-card/acao-card';

export function Home() {
  const [stocks, setStocks] = useState<Acoes[]>();
  const [currentStock, setCurrentStock] = useState<string>();
  const { isDbOk, repository } = useStorage();

  useEffect(() => {
    document.title = `Início | ${process.env.REACT_APP_TITLE}`
  }, []);

  useEffect(() => {
    if (isDbOk)
      load();
  }, [isDbOk]);

  useEffect(() => {
    if (isDbOk)
      loadHistory();
  }, [isDbOk, currentStock]);

  async function load() {
    const acoes = await repository.acoes.listActives();

    setStocks(acoes);
  }

  async function loadHistory() {
    if (currentStock == null) return;

    // const response = await fetch(`https://localhost:7062/stock/history?stockId=${currentStock}`);
    // const json = (await response.json()) as StockHistoryResponse;

    // setHistory(json.data.map(x => ({
    //   time: moment(x.date).format('YYYY-MM-DD'),
    //   open: x.open,
    //   close: x.close,
    //   high: x.max,
    //   low: x.min,
    // })));

    // setHistoryOriginal(json.data);
  }

  return (
    <Layout>
      <section className='container'>
        {stocks == null ? <div className="alert alert-info">Carregando ações ativas...</div>
          : (
            stocks.length === 0 ? (<div className="alert alert-info">Nenhuma ação ativa...</div>) : (
              <div className="stocks">
                {stocks.map(x => (
                  <AcaoCard key={x.codigo} acao={x} isActive={x.codigo === currentStock} onClick={s => setCurrentStock(s.codigo)} />
                ))}
              </div>
            )
          )
        }
      </section>
    </Layout>
  );
}
