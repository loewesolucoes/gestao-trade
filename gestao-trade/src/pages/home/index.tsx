import logo from './logo.svg';
import './index.scss';
import { Layout } from '../../shared/layout';
import { useEffect, useState } from 'react';
import { Acoes } from '../../repositories/acoes';
import { useStorage } from '../../contexts/storage';
import { AcaoCard } from '../acoes/acao-card/acao-card';
import { ChartComponent, ChartIntraday } from '../../components/chart';
import { NotificationUtil } from '../../utils/notification';
import moment from 'moment';

interface HistoricoAcao { }

export default function () {
  const [acoes, setAcoes] = useState<Acoes[]>();
  const [acaoEscolhida, setAcaoEscolhida] = useState<string>();
  const [historico, setHistorico] = useState<ChartIntraday[]>();
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
    setHistorico(undefined);
    if (acaoEscolhida == null) return;

    const historico = await repository.historicoAcoes.listByCode(acaoEscolhida);

    setHistorico(historico.map(x => ({
      time: moment(x.date).format('YYYY-MM-DD'),
      open: x.open?.toNumber(),
      close: x.close?.toNumber(),
      high: x.high?.toNumber(),
      low: x.low?.toNumber(),
    })));
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
              : <ChartComponent className="chart container-sm" data={historico as any}></ChartComponent>}
          </>
        }
      </section>
    </Layout>
  );
}
