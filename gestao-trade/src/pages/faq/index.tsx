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
        <h1>Perguntas Frequentes</h1>
        <p>Pagina em contrução</p>
      </section>
    </Layout>
  );
}
