import './index.scss';
import { Layout } from '../../shared/layout';
import { useEffect, useState } from 'react';
import { PaginationControl } from '../../components/pagination';
import { AcaoCard } from './acao-card/acao-card';
import { Acoes } from '../../repositories/acoes';
import { TimerUtil } from '../../utils/timer';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useStorage } from '../../contexts/storage';
import { Input } from '../../components/input';

const PAGE_PARAM_NAME = "page";
const SEARCH_PARAM_NAME = "q";

let debounceLoad: any = null;

export default function () {
  const [searchStr, setSearchStr] = useState<string>('');
  const [acoes, setAcoes] = useState<Acoes[]>([]);
  const [take, setTake] = useState<number>(25);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(100);
  const [isLoadingMark, setIsLoadingMark] = useState<boolean>(false);
  const [acoesEscolhidas, setAcoesEscolhidas] = useState<{ [key: string]: Acoes }>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { repository, isDbOk } = useStorage();

  useEffect(() => {
    document.title = `Ações | ${process.env.REACT_APP_TITLE}`
  }, []);

  debounceLoad = debounceLoad || TimerUtil.debounce((loadAndSet: any) => loadAndSet(), 500);

  useEffect(() => {
    var page = searchParams.get(PAGE_PARAM_NAME)
    var search = searchParams.get(SEARCH_PARAM_NAME)

    page && setPage(Number(page) || 1);
    search && setSearchStr(search);
  }, []);

  useEffect(() => debounceLoad(loadAndSet), [isDbOk, take, page, searchStr]);

  function loadAndSet() {
    setSearchParam();

    if (isDbOk)
      load();
  }

  function setSearchParam() {
    const params = new URLSearchParams(searchParams);

    params.set(PAGE_PARAM_NAME, `${page}`);
    params.set(SEARCH_PARAM_NAME, `${searchStr}`);

    setSearchParams(params.toString());
  }

  async function load() {
    const { acoes, total } = await repository.acoes.listPaginado(searchStr, page, take);

    setAcoesEscolhidas({});
    setAcoes(acoes);
    setTotal(total);
  }

  function MarkStock(stock: Acoes): void {
    const newMarkeds = { ...acoesEscolhidas };

    if (newMarkeds[stock.codigo] == null)
      newMarkeds[stock.codigo] = stock;
    else
      delete newMarkeds[stock.codigo];

    setAcoesEscolhidas(newMarkeds);
  }

  async function toogleMark(markedStocks: { [key: string]: Acoes; }) {
    setIsLoadingMark(true);

    let success = false;

    try {
      const acoes = Object.values(markedStocks);

      await repository.acoes.marcarComoAtivos(acoes);

      await load();
      success = true;
    } catch (ex) {
      console.error("erro ao salvar", ex);
    }

    if (success)
      window.alert('Salvo com sucesso!')
    else
      window.confirm('Erro ao salvar!')

    setIsLoadingMark(false);
  }

  function onChangeSearch(value: string) {
    setSearchStr(value);
    setPage(1);
  }

  return (
    <Layout>
      <section className='container'>
        <h1>Ações</h1>
        {isLoadingMark && (<div className="loading">Carregando...</div>)}
        <div className="mark-section">
          <div className="form-group">
            <label htmlFor="buscaAtivo" className="form-label">Buscar ativo:</label>
            <Input type="search" id="buscaAtivo" name="buscaAtivo" className="form-control" placeholder="PETR4, AZUL4, etc" value={searchStr} onChange={onChangeSearch} />
          </div>
          <div className="buttons">
            {Object.keys(acoesEscolhidas).length > 0 && (
              <>
                <button type="button" className="btn btn-success btn-sm" onClick={() => toogleMark(acoesEscolhidas)}>Marcar como ativo(s) / inativo(s)</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAcoesEscolhidas({})}>Limpar seleção</button>
              </>
            )}
          </div>
        </div>
        {!isLoadingMark && (
          <>
            {acoes.length === 0 ? <div className='alert alert-info'>Nenhuma ação encontrada, realize as integrações para carregar as ações.</div> : null}
            <div className="cards">
              {acoes.map(s => (
                <AcaoCard key={s.codigo} acao={s} isActive={!!acoesEscolhidas[s.codigo]} onClick={MarkStock} />
              ))}
            </div>
            <div className="pagination-section">
              <PaginationControl page={page} total={total} limit={take} ellipsis={10} onChangePage={page => setPage(page)}></PaginationControl>
              <select className="form-select" value={take} onChange={e => setTake(Number(e?.target?.value) || 20)}>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}
