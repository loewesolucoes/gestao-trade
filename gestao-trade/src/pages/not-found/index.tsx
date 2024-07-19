import './index.scss';
import { Layout } from '../../shared/layout';
import { useEffect } from 'react';

export default function () {
  useEffect(() => {
    document.title = `Perguntas frequentes | ${process.env.REACT_APP_TITLE}`
  }, []);

  return (
    <Layout>
      <section className='container'>
        <h1>404: Pagina não encontrada</h1>
        <p>Pagina em contrução</p>
      </section>
    </Layout>
  );
}
