import logo from './logo.svg';
import './home.scss';
import { Layout } from '../../shared/layout';
import { useEffect, useState } from 'react';
import { Acoes } from '../../repositories/acoes';
import { useStorage } from '../../contexts/storage';
import { AcaoCard } from '../acoes/acao-card/acao-card';
import { ChartComponent } from '../../components/chart';

interface HistoricoAcao { }

export function Home() {
  const [acoes, setAcoes] = useState<Acoes[]>();
  const [acaoEscolhida, setAcaoEscolhida] = useState<string>();
  const [historico, setHistorico] = useState<HistoricoAcao[]>([]);
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
  }, [isDbOk, acaoEscolhida]);

  async function load() {
    const acoes = await repository.acoes.listActives();

    setAcoes(acoes);
  }

  async function loadHistory() {
    if (acaoEscolhida == null) return;

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
        {acoes == null ? <div className="alert alert-info">Carregando ações ativas...</div>
          : (
            acoes.length === 0 ? (<div className="alert alert-info">Nenhuma ação ativa...</div>) : (
              <div className="stocks">
                {acoes.map(x => (
                  <AcaoCard key={x.codigo} acao={x} isActive={x.codigo === acaoEscolhida} onClick={s => setAcaoEscolhida(s.codigo)} />
                ))}
              </div>
            )
          )
        }
        {acaoEscolhida == null ? <div className="alert alert-warning">Escolha uma ação para analisar</div>
          : <>
            <section className="card analysis">
              <div className="card-header">Analise</div>
            </section>
            {historico == null ? <div className="alert alert-info">Carregando histórico...</div>
              : <ChartComponent className="chart container-sm" data={[]}></ChartComponent>}
          </>
        }
      </section>
    </Layout>
  );
}
