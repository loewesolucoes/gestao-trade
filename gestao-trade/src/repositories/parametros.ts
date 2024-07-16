import { DefaultFields, DefaultRepository, TableNames } from "./default";

export interface Parametro extends DefaultFields {
  chave: string
  valor?: string
}

const BRAPI_KEY = 'BRAPI_API_KEY';

export class ParametrosRepository extends DefaultRepository {
  private _paramsDict?: { [key: string]: Parametro };

  public async getDict(): Promise<{ [key: string]: Parametro }> {
    if (this._paramsDict == null) {
      this._paramsDict = await this.loadParamsOrDefault();
    }

    return this._paramsDict;
  }

  private async loadParamsOrDefault() {
    const params = (await this.list<Parametro>(TableNames.PARAMETROS)).reduce((p, n) => { p[n.chave] = n; return p; }, {});
    const nextParams = params;

    nextParams[BRAPI_KEY] = params[BRAPI_KEY] || { chave: BRAPI_KEY, valor: '' };

    const newParams = Object.keys(nextParams).map(x => nextParams[x]).filter(x => x.id == null);

    await Promise.all(newParams.map(x => this.save(TableNames.PARAMETROS, x)));

    return nextParams;
  }

  public async getByKey(chave: string): Promise<Parametro> {
    return (await this.getDict())[chave];
  }

  public async getValorByKey(chave: string): Promise<string | undefined> {
    return (await this.getDict())[chave]?.valor;
  }

  public async set(chave: string, valor?: string) {
    const paramsDict = await this.getDict();
    let param = paramsDict[chave];

    if (param == null)
      param = {} as any;

    const result = await this.save(TableNames.PARAMETROS, { ...param, chave, valor });

    delete this._paramsDict;

    return result;
  }
}