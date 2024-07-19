import './index.scss';
import { Layout } from '../../shared/layout';
import { useEffect } from 'react';
import { useIntegration } from '../../contexts/integration';
import { Loader } from '../../components/loader';

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
  const { loadAll } = useIntegration();

  return <div className='d-flex gap-3 flex-column'>
    <div className="card">
      <h4 className="card-header">
        Geral
      </h4>
      <div className="card-body">
        <div className='d-flex gap-3 '>
          <button type='button' className='btn btn-primary' onClick={loadAll}>Carregar todas integrações</button>
          <button type='button' className='btn btn-secondary'>Carregar tudo do BRAPI</button>
          <button type='button' className='btn btn-secondary'>Carregar tudo do Yahoo</button>
        </div>
      </div>
    </div>
    <div className="card">
      <h4 className="card-header d-flex justify-content-between">
        Yahoo
        <button type='button' className='btn btn-secondary'>Integrar BRAPI</button>
      </h4>
      <div className="card-body">
        <h5 className="card-title">Ações que precisam integrar</h5>
      </div>
    </div>
    <div className="card">
      <h4 className="card-header">
        BRAPI
      </h4>
      <div className="card-body">
        <button type='button' className='btn btn-secondary'>Integrar BRAPI</button>
      </div>
    </div>
  </div>;
}

