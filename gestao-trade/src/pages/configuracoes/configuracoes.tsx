import './configuracoes.scss';
import { Layout } from '../../shared/layout';
import { Loader } from '../../components/loader';
import { useEffect, useState } from 'react';
import { useEnv } from '../../contexts/env';
import { useStorage } from '../../contexts/storage';
import { Parametro } from '../../repositories/parametros';
import { Input } from '../../components/input';

export function Configuracoes() {
  const [isLoading, setIsLoading] = useState(false);
  const { isDbOk, exportOriginalDumpToFileAndDownload, importOriginalDumpFromFile, repository } = useStorage();
  const { aplicationName } = useEnv()
  const [file, setFile] = useState<File>()
  const [params, setParams] = useState<Parametro[]>([])

  useEffect(() => {
    document.title = `Configurações | ${process.env.REACT_APP_TITLE}`
  }, []);

  useEffect(() => {
    if (isDbOk) {
      loadParams();
    }
  }, [isDbOk]);

  async function loadParams() {
    setIsLoading(true);

    const paramsDict = await repository.params.getDict();

    setParams(Object.values(paramsDict));
    setIsLoading(false);
  }

  function handleChange(event: any) {
    setFile(event.target.files[0])
  }

  async function exportToDb() {
    setIsLoading(true);

    await exportOriginalDumpToFileAndDownload(`${aplicationName}.db`);

    setIsLoading(false);
  }

  async function importFromDb() {
    setIsLoading(true);

    await importOriginalDumpFromFile(file);

    alert('arquivo carregado com sucesso');
    setIsLoading(false);
  }

  const isAllLoading = isLoading || !isDbOk

  return (
    <Layout>
      <main className="main container my-3">
        <h1>Configurações da aplicação</h1>
        <article className={`configs ${isAllLoading && 'is-loading'}`}>
          {isAllLoading
            ? <Loader />
            : (
              <>
                <section className="card">
                  <h5 className="card-header">Carregar dados de um arquivo</h5>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="formFile" className="form-label">Escolha um arquivo do tipo .db</label>
                      <input className="form-control" type="file" id="formFile" accept=".db,.sqlite" onChange={handleChange} />
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={importFromDb}>Clique para carregar dados de um arquivo</button>
                  </div>
                </section>
                <section className="card">
                  <h5 className="card-header">Exportar dados para um arquivo</h5>
                  <div className="card-body">
                    <button type="button" className="btn btn-secondary" onClick={exportToDb}>Clique para exportar dados para um arquivo</button>
                  </div>
                </section>
                <section className="card gdrive">
                  <h5 className="card-header">Google drive</h5>
                  <div className="card-body">
                    ...
                    {/* <AuthButton /> */}
                  </div>
                </section>
                <section className="card">
                  <h5 className="card-header">Parâmetros</h5>
                  <div className="card-body">
                    <div className="flex-grow-1">
                      <label htmlFor="chave" className="form-label">Nome chave: </label>
                      <select className={`form-select`} id="chave" onChange={e => e}>
                        <option>Escolha um parâmetro</option>
                        {params.map(x => (
                          <option key={x.chave} value={x.chave}>{x.chave}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-grow-1">
                      <label htmlFor="valor" className="form-label">Valor: </label>
                      <Input type="text" className="form-control" id="valor" onChange={e => e} value={null} placeholder="Descrição" />
                    </div>
                  </div>
                </section>
              </>
            )}
        </article>
      </main>
    </Layout>
  );
}
