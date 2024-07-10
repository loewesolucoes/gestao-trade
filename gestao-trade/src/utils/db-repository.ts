import moment from 'moment';
import initSqlJs from 'sql.js';
import BigNumber from 'bignumber.js';
import localforage from 'localforage'
import { Buffer } from 'buffer';

let SQL: import('sql.js').SqlJsStatic

export enum MapperTypes {
  DATE,
  DATE_TIME,
  NUMBER,
  IGNORE,
}

export enum TableNames {
  CONFIGURACOES = "configuracoes",
}

const DEFAULT_MAPPING = { createdDate: MapperTypes.DATE_TIME, updatedDate: MapperTypes.DATE_TIME, monthYear: MapperTypes.IGNORE };
const BUFFER_TYPE = 'base64';
const RUNNED_MIGRATION_CODE = 'runned';

interface DefaultFields {
  id: number
  createdDate: Date
  updatedDate?: Date
}

enum StockType {
  COMPANY = 1,
  FII = 2,
  ETFS = 3,
  OTHERS = 4,
}

export interface Acoes extends DefaultFields {
  nome?: string
  codigo?: string
  tipo?: StockType
  active?: boolean
  setor?: string
  valorDeMercado?: BigNumber
}

export interface Parametros extends DefaultFields {
  chave: string
  valor?: string
}

export class DbRepository {
  public static readonly DB_NAME = 'gestao-trade.settings.db';
  private constructor(private db: import('sql.js').Database) { }

  public static async create(data?: ArrayLike<number> | Buffer | null) {
    if (SQL == null) {
      SQL = await initSqlJs({
        // Fetch sql.js wasm file from CDN
        // This way, we don't need to deal with webpack
        locateFile: (file) => `${process.env.PUBLIC_URL}/${file}`,
      })
    }

    const localDump = await DbRepository.exportLocalDump();

    if (data == null && localDump != null) {
      data = Buffer.from(localDump, BUFFER_TYPE);
    }

    const db = new SQL.Database(data);

    const repo = new DbRepository(db);

    await repo.runMigrations();

    if (process.env.NODE_ENV !== 'production') {
      //@ts-ignore
      window._db = db;
    }

    // repo.beforeClose();

    return repo;
  }

  public static async persistLocalDump(dump?: string): Promise<void> {
    await localforage.setItem(DbRepository.DB_NAME, dump || '');
  }

  public static async exportLocalDump(): Promise<string | null> {
    return await localforage.getItem<string>(DbRepository.DB_NAME);
  }

  public async exportOriginalDump() {
    await Promise.resolve();

    return this.db.export();
  }

  public async persistDb() {
    const dump = await this.exportDump();

    await DbRepository.persistLocalDump(dump)
    console.info("persistDb ok");
  }

  public async deletePeriod(tableName: TableNames, month: string, year: string) {
    this.db.exec(`delete from ${tableName} where strftime('%m', data) = $month and strftime('%Y', data) = $year`, { "$month": month, "$year": year })

    await this.persistDb();
  }

  public async save(tableName: TableNames, data: any) {
    let result = {} as any;

    if (data?.id != null)
      result = this.update(tableName, data)
    else
      result = this.insert(tableName, data);

    await this.persistDb();

    return result;
  }

  public async delete(tableName: TableNames, id: number) {
    let result = {} as any;

    this.db.exec(`delete from ${tableName} where id = $id`, { "$id": id })

    await this.persistDb();

    return result;
  }

  public async list<T>(tableName: TableNames): Promise<T[]> {
    await Promise.resolve();

    const result = this.db.exec(`SELECT strftime('%Y-%m', data) AS monthYear, * FROM ${tableName} order by data desc`);

    if (!Array.isArray(result))
      throw new Error(`${tableName} não encontrado (a)`);

    return this.parseSqlResultToObj(result, DEFAULT_MAPPING)[0] || [];
  }

  public async get<T>(tableName: TableNames, id: string): Promise<T> {
    await Promise.resolve();

    const result = this.db.exec(`select * from ${tableName} where id = $id`, { "$id": id });

    if (result.length === 0)
      throw new Error(`${tableName} não encontrado (a)`);

    return this.parseSqlResultToObj(result, DEFAULT_MAPPING)[0][0];
  }

  private async insert(tableName: TableNames, data: any) {
    const { command, params, nextData } = this.createInsertCommand(tableName, data);
    const fullCommand = `${command};SELECT LAST_INSERT_ROWID();`

    const result = this.db.exec(fullCommand, params);

    nextData.id = result[0].values[0][0];

    return nextData;
  }

  private createInsertCommand(tableName: TableNames, data: any, paramsPrefix: string = '') {
    const nextData = { ...data, createdDate: new Date() };
    const { keys, params } = this.parseToCommand(nextData, paramsPrefix);
    const command = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys.map(k => `$${k}${paramsPrefix}`).join(', ')})`;

    return { command, params, nextData }
  }

  private async update(tableName: TableNames, data: any) {
    const { command, params } = this.createUpdateCommand(tableName, data);

    this.db.exec(command, params);

    return this.get(tableName, data.id);
  }

  private createUpdateCommand(tableName: TableNames, data: any, paramsPrefix: string = '') {
    const nextData = { ...data, updatedDate: new Date() };
    const { keys, params } = this.parseToCommand(nextData, paramsPrefix);
    const command = `UPDATE ${tableName} SET ${keys.map(k => `${k}=$${k}${paramsPrefix}`).join(', ')} WHERE id=$id${paramsPrefix}`;

    return { command, params, nextData }
  }

  private parseSqlResultToObj(result: initSqlJs.QueryExecResult[], mapper?: { [key: string]: MapperTypes }) {
    return result.map(res => res.values.map(values => res.columns.reduce((p, n, i) => {
      const value = values[i];
      let original = true;

      if (n !== 'id' && value != null) {
        if (mapper != null) {
          if (mapper[n] === MapperTypes.DATE) {
            p[n] = moment(value as any, 'YYYY-MM-DD').toDate(); //2022-11-03 00:00:00
            original = false;
          } else if (mapper[n] === MapperTypes.DATE_TIME) {
            p[n] = moment(value as any, 'YYYY-MM-DD hh:mm:ss').toDate(); //2022-11-03 00:00:00
            original = false;
          } else if (mapper[n] === MapperTypes.NUMBER) {
            p[n] = value;
            original = false;
          } else if (mapper[n] === MapperTypes.IGNORE) {
            original = false;
          }
        }

        if (original && typeof (value) === 'number') {
          p[n] = BigNumber(value);
          original = false;
        }
      }

      if (original)
        p[n] = value;

      return p;
    }, {} as any)));
  }

  private parseToCommand(nextData: any, paramsPrefix: string = '') {
    const keys = Object.keys(nextData).filter(k => nextData[k] !== undefined);
    const params = keys.reduce((p, n) => {
      let value = nextData[n] ?? null;

      if (value instanceof Date) {
        value = moment(value).format();
      }

      if (value?._isBigNumber) {
        value = value.toNumber();
      }

      p[`$${n}${paramsPrefix}`] = value;

      return p;
    }, {} as any);

    return { keys, params };
  }

  private beforeClose() {
    const beforeUnload = (e: any) => {
      const message = "Ter certeza que deseja sair?";
      const event = e || window.event;

      // For IE and Firefox
      if (event) {
        event.returnValue = message;
      }

      this.persistDb();

      // For Safari
      return message;
    };

    window.addEventListener("beforeunload", beforeUnload);
  }

  private async exportDump() {
    await Promise.resolve();
    const exp = this.db.export();
    const dump = Buffer.from(exp).toString(BUFFER_TYPE);

    return dump;
  }

  private async runMigrations() {
    await Promise.resolve();

    this.db.exec(`CREATE TABLE IF NOT EXISTS "migrations" ("id" INTEGER NOT NULL,"name" TEXT NULL DEFAULT NULL,"executedDate" DATETIME NULL,PRIMARY KEY ("id"));`);

    const result = this.db.exec('select * from "migrations"');
    const migrations = (this.parseSqlResultToObj(result)[0] || []).reduce((p, n) => { p[n.name] = n; return p; }, {} as any);

    if (migrations['parametros'] == null) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS "parametros" ("id" INTEGER NOT NULL,"chave" TEXT NOT NULL,"valor" TEXT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['parametros'] = RUNNED_MIGRATION_CODE;
    }

    if (migrations['acoes'] == null) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS "acoes" ("id" INTEGER NOT NULL,"nome" TEXT NOT NULL,"logo" TEXT NULL,"codigo" TEXT NULL, "tipo" INTEGER NULL, "active" INTEGER NULL, "valorDeMercado" REAL NULL, "setor" TEXT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['acoes'] = RUNNED_MIGRATION_CODE;
    }

    const runnedMigrations = Object.keys(migrations).filter(x => migrations[x] === RUNNED_MIGRATION_CODE).reduce((p, n) => { p.push({ name: n, executedDate: new Date() }); return p; }, [] as any)

    let allParams = {};
    let fullCommand = '';

    if (runnedMigrations.length > 0) {
      runnedMigrations.forEach((x, i) => {
        const { keys, params } = this.parseToCommand(x, `${i}`);
        const command = `INSERT INTO "migrations" (${keys.join(', ')}) VALUES (${keys.map(k => `$${k}${i}`).join(', ')})`;

        fullCommand = `${fullCommand};${command}`
        allParams = { ...allParams, ...params }
      });

      this.db.exec(fullCommand, allParams);
    }

    await this.persistDb();
  }
}