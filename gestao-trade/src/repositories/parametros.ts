import { DefaultFields, DefaultRepository, TableNames } from "./default";

export interface Parametro extends DefaultFields {
  chave: string
  valor?: string
}

export class ParametrosRepository extends DefaultRepository {
  private _paramsDict?: { [key: string]: Parametro };

  public async getDict(): Promise<{ [key: string]: Parametro }> {
    if (this._paramsDict == null)
      this._paramsDict = (await this.list<Parametro>(TableNames.PARAMETROS)).reduce((p, n) => { p[n.chave] = n; return p; }, {});

    return this._paramsDict;
  }

  public async getByKey(chave: string): Promise<Parametro> {
    return (await this.getDict())[chave];
  }

  public async getValorByKey(chave: string): Promise<string | undefined> {
    return (await this.getDict())[chave]?.valor;
  }

  public async set(chave: string, valor: string) {
    let param = this.getDict()[chave];

    if (param == null)
      param = {};

    await this.save(TableNames.PARAMETROS, { ...param, chave, valor });
    delete this._paramsDict;
  }
}