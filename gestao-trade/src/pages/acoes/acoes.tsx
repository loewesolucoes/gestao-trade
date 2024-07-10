import './acoes.scss';
import { Layout } from '../../shared/layout';
import { useEffect } from 'react';

export function Acoes() {
  useEffect(() => {
    document.title = `Ações | ${process.env.REACT_APP_TITLE}`
  }, []);

  return (
    <Layout>
      <section className='container'>
        <h1>Ações</h1>
        <p>Pagina em contrução</p>
      </section>
    </Layout>
  );
}
