import BigNumber from "bignumber.js";
import moment from "moment";
import { Database, RepositoryUtil } from "../utils/db-repository";

export enum MapperTypes {
  DATE,
  DATE_TIME,
  NUMBER,
  IGNORE,
}

export enum TableNames {
  ACOES = "acoes",
  PARAMETROS = "parametros",
}

export interface DefaultFields {
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

const RUNNED_MIGRATION_CODE = 'runned';
const DEFAULT_MAPPING = { createdDate: MapperTypes.DATE_TIME, updatedDate: MapperTypes.DATE_TIME, monthYear: MapperTypes.IGNORE };

export class DefaultRepository {
  public constructor(protected db: Database) { }

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

    await this.db.exec(`delete from ${tableName} where id = $id`, { "$id": id })

    await this.persistDb();

    return result;
  }

  public async list<T>(tableName: TableNames): Promise<T[]> {
    await Promise.resolve();

    const result = await this.db.exec(`SELECT * FROM ${tableName} order by createdDate desc`);

    if (!Array.isArray(result))
      throw new Error(`${tableName} não encontrado (a)`);

    return this.parseSqlResultToObj(result, DEFAULT_MAPPING)[0] || [];
  }

  public async get<T>(tableName: TableNames, id: string): Promise<T> {
    await Promise.resolve();

    const result = await this.db.exec(`select * from ${tableName} where id = $id`, { "$id": id });

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

    await this.db.exec(command, params);

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

  private async runMigrations() {
    await Promise.resolve();

    await this.db.exec(`CREATE TABLE IF NOT EXISTS "migrations" ("id" INTEGER NOT NULL,"name" TEXT NULL DEFAULT NULL,"executedDate" DATETIME NULL,PRIMARY KEY ("id"));`);

    const result = await this.db.exec('select * from "migrations"');
    const migrations = (this.parseSqlResultToObj(result)[0] || []).reduce((p, n) => { p[n.name] = n; return p; }, {} as any);

    if (migrations['parametros'] == null) {
      await this.db.exec(`CREATE TABLE IF NOT EXISTS "parametros" ("id" INTEGER NOT NULL,"chave" TEXT NOT NULL,"valor" TEXT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['parametros'] = RUNNED_MIGRATION_CODE;
    }

    if (migrations['acoes'] == null) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS "acoes" ("id" INTEGER NOT NULL,"nome" TEXT NOT NULL,"logo" TEXT NULL,"codigo" TEXT NULL, "tipo" INTEGER NULL, "active" INTEGER NULL, "valorDeMercado" REAL NULL, "setor" TEXT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['acoes'] = RUNNED_MIGRATION_CODE;
    }

    // TODO: Add parametros iniciais em branco

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

      await this.db.exec(fullCommand, allParams);
    }

    await this.persistDb();
  }

  public async exportOriginalDump() {
    return await this.db.export();
  }

  public async persistDb() {
    const dump = await this.exportDump();

    await RepositoryUtil.persistLocalDump(dump)
    console.info("persistDb ok");
  }

  private async exportDump() {
    await Promise.resolve();
    const exp = await this.db.export();

    return await RepositoryUtil.generateDumpFromExport(exp)
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
}