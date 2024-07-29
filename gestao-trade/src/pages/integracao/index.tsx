import './index.scss';
import { Layout } from '../../shared/layout';
import { useEffect, useState } from 'react';
import { useIntegration } from '../../contexts/integration';
import { Loader } from '../../components/loader';
import { useStorage } from '../../contexts/storage';
import { IntegracaoHistoricoAcao, IntervaloHistoricoAcoes } from '../../repositories/historico-acoes';
import { AcaoCard } from '../acoes/acao-card/acao-card';
import { ReactComponent as ArrowClockWise } from "./arrow-clockwise.svg";
import { NotificationUtil } from '../../utils/notification';

export default function () {
  const { isLoadingIntegration } = useIntegration();

  useEffect(() => {
    document.title = `Integração | ${process.env.REACT_APP_TITLE}`
  }, []);

  return (
    <Layout>
      <article className='container'>
        <h1>Integração</h1>
        {isLoadingIntegration ? <Loader /> : <CardsDaIntegracao />}
      </article>
    </Layout>
  );
}
function CardsDaIntegracao() {
  const { loadAll, loadBrapi, loadYahoo } = useIntegration();
  const { repository, isDbOk, refresh } = useStorage();
  const [isLoading, setIsLoading] = useState(true)
  const [acoesQuePrecisamAtualizar, setAcoesQuePrecisamAtualizar] = useState<IntegracaoHistoricoAcao[]>([])

  useEffect(() => {
    isDbOk && load();
  }, [isDbOk]);

  async function load() {
    setIsLoading(true);
    const result = await repository.historicoAcoes.acoesQuePrecisamAtualizar(IntervaloHistoricoAcoes.UM_DIA);

    setAcoesQuePrecisamAtualizar(result);
    setIsLoading(false);
  }

  async function setAllAsInactive() {
    setIsLoading(true);

    await repository.acoes.desabilitarTudo();

    NotificationUtil.send('Desativado todas ações com sucesso.')

    await refresh();

    setIsLoading(false);
  }

  async function removerUltimoDiaDoHistorico() {
    setIsLoading(true);

    await repository.historicoAcoes.removerUltimoDiaDoHistorico();

    NotificationUtil.send('Removido ultimo dia do histórico sucesso.')

    await refresh();

    setIsLoading(false);
  }

  return isLoading ? <Loader /> : (
    <div className='d-flex gap-3 flex-column'>
      <div className="card">
        <h4 className="card-header">
          Geral
        </h4>
        <div className="card-body">
          <div className='d-flex gap-3 flex-column flex-lg-row'>
            <button type='button' className='btn btn-primary' onClick={loadAll}><ArrowClockWise /> Carregar todas integrações</button>
            <button type='button' className='btn btn-secondary' onClick={loadBrapi}><ArrowClockWise /> Carregar tudo do BRAPI</button>
            <button type='button' className='btn btn-secondary' onClick={loadYahoo}><ArrowClockWise /> Carregar tudo do Yahoo</button>
          </div>
        </div>
      </div>
      <div className="card">
        <h4 className="card-header d-flex justify-content-between">
          Yahoo
          <button type='button' className='btn btn-secondary' onClick={loadYahoo}><ArrowClockWise /> Integrar Yahoo</button>
        </h4>
        <div className="card-body">
          <button type='button' className='btn btn-secondary mb-3' onClick={removerUltimoDiaDoHistorico}>❌ Remover ultimo dia do histórico</button>
          <h5 className="card-title">Ações que precisam integrar</h5>
          {acoesQuePrecisamAtualizar == null ? <div className="alert alert-info">Carregando ações ativas...</div>
            : (
              acoesQuePrecisamAtualizar.length === 0 ? (<div className="alert alert-info">Nenhuma ação ativa ou que precise atualizar...</div>) : (
                <div className="stocks">
                  {acoesQuePrecisamAtualizar.map(x => ({ codigo: x.codigoAcao, logo: x.logoAcao })).map(x => (
                    <AcaoCard key={x.codigo} acao={x as any} isActive={false} onClick={alert} />
                  ))}
                </div>
              )
            )
          }
        </div>
      </div>
      <div className="card">
        <h4 className="card-header">
          BRAPI
        </h4>
        <div className="card-body d-flex gap-3">
          <button type='button' className='btn btn-secondary' onClick={loadBrapi}><ArrowClockWise /> Integrar BRAPI</button>
          <button type='button' className='btn btn-secondary' onClick={setAllAsInactive}>🔕 Marcar tudo como inativo</button>
        </div>
      </div>
    </div>
  )
}

