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
import { analysisService } from '../../services/analysis';
import { Input } from '../../components/input';
import { useEnv } from '../../contexts/env';

export default function () {
  const { isMobile } = useEnv();
  const { isDbOk, repository } = useStorage();

  const monthsBefore = isMobile ? -1 : -3;
  const [initialDate, setInitialDate] = useState<string>(moment().add(monthsBefore, 'months').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [acoes, setAcoes] = useState<Acoes[]>();
  const [acaoEscolhida, setAcaoEscolhida] = useState<string>();
  const [historico, setHistorico] = useState<ChartIntraday[]>();

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

    analysisService.run(historico, initialDate, endDate);
  }

  return (
    <Layout>
      <section className='container'>
        <div className="configs">
          <div className="form-group">
            <label htmlFor="dataInicio" className="form-label">Data inicio:</label>
            <Input type="date" id="dataInicio" name="dataInicio" className="form-control" value={initialDate} onChange={value => setInitialDate(value)} />
          </div>
          <div className="form-group">
            <label htmlFor="dataFim" className="form-label">Data fim:</label>
            <Input type="date" id="dataFim" name="dataFim" className="form-control" value={endDate} onChange={value => setEndDate(value)} />
          </div>
        </div>
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
              : <ChartComponent className="chart" data={historico as any} visibleFrom={initialDate} visibleTo={endDate}></ChartComponent>}
          </>
        }
      </section>
    </Layout>
  );
}
