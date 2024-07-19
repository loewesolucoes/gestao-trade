import './index.scss';
import { Layout } from '../../shared/layout';
import { useEffect } from 'react';

export default function () {
  useEffect(() => {
    document.title = `Relatórios | ${process.env.REACT_APP_TITLE}`
  }, []);

  return (
    <Layout>
      <section className='container'>
        <h1>Relatórios</h1>
        <p>Pagina em contrução</p>
      </section>
    </Layout>
  );
}
