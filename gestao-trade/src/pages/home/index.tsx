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
  const [analysis, setAnalysis] = useState<any>();
  const [showFibo, setShowFibo] = useState<boolean>(false);
  const [showMovements, setShowMovements] = useState<boolean>(false);

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
    setAnalysis(undefined);
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

    const analysis = analysisService.run(historico, initialDate, endDate);

    setAnalysis({
      fibos: analysis
        .fibos
        // @ts-ignore
        .filter(x => x.movementType !== 'UNCOMPLETED')
        .map(x => ({
          ...x,
          alvo1: x.alvo1?.toNumber(),
          alvo2: x.alvo2?.toNumber(),
          alvo3: x.alvo3?.toNumber(),
          fibo0: x.fibo0?.toNumber(),
          fibo382: x.fibo382?.toNumber(),
          fibo618: x.fibo618?.toNumber(),
          fibo50: x.fibo50?.toNumber(),
          fibo1000: x.fibo1000?.toNumber(),
        }))
    });
  }

  return (
    <Layout>
      <section className='container'>
        <div className="stocks">
          {acoes == null
            ? <div className="alert alert-info">Carregando ações ativas...</div>
            : (
              acoes.length === 0
                ? (<div className="alert alert-info">Nenhuma ação ativa...</div>)
                : acoes.map(x => (
                  <AcaoCard key={x.codigo} acao={x} isActive={x.codigo === acaoEscolhida} onClick={s => setAcaoEscolhida(s.codigo)} />
                ))
            )
          }
        </div>
        <div className="configs my-3 gap-3 d-flex flex-column flex-lg-row">
          <div className="form-group">
            <label htmlFor="dataInicio" className="form-label">Data inicio:</label>
            <Input type="date" id="dataInicio" name="dataInicio" className="form-control" value={initialDate} onChange={value => setInitialDate(value)} />
          </div>
          <div className="form-group">
            <label htmlFor="dataFim" className="form-label">Data fim:</label>
            <Input type="date" id="dataFim" name="dataFim" className="form-control" value={endDate} onChange={value => setEndDate(value)} />
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowFibo(!showFibo)}>Mostrar Fibo</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowMovements(!showMovements)}>Mostrar Movimentos</button>
        </div>
        {acaoEscolhida == null ? <div className="alert alert-warning">Escolha uma ação para analisar</div>
          : <>
            {historico?.length === 0 && <div className="alert alert-info">Nenhum historico encontrado, realize as integrações para carregar o historico das ações.</div>}
            {historico == null ? <div className="alert alert-info">Carregando histórico...</div>
              : <ChartComponent className="chart" data={historico as any} visibleFrom={initialDate} visibleTo={endDate} analysis={analysis} options={{ showFibo, showMovements }}></ChartComponent>}
            <section className="card analysis">
              <div className="card-header">Analise</div>
              <div className="card-body">
                {analysis == null ? <div className="alert alert-info">Carregando analises...</div>
                  : (
                    <div style={{ "whiteSpace": "pre", maxHeight: 300, overflow: 'auto' }}>{filterAnalysis(analysis)}</div>
                  )
                }
              </div>
            </section>
          </>
        }
      </section>
    </Layout>
  );
}

function filterAnalysis(analysis: any): any {
  return JSON.stringify({
    ...analysis,
    fibos: analysis
      .fibos
      // .filter((x: any) => x.bateuAlvo1)
      .map((x: any) => {
        return {
          ...x,
          movements: undefined
        }
      }).reverse()
  }, null, 4);
}
