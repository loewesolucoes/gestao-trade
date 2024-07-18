import BigNumber from "bignumber.js";
import moment from "moment";
import { RepositoryUtil } from "../utils/repository";
import { IDatabase } from "./database-connector";

export enum MapperTypes {
  DATE,
  DATE_TIME,
  NUMBER,
  BOOLEAN,
  IGNORE,
}

export enum TableNames {
  ACOES = "acoes",
  HISTORICO_ACOES = "historico_acoes",
  PARAMETROS = "parametros",
}

export interface DefaultFields {
  id: number
  createdDate: Date
  updatedDate?: Date
}

const RUNNED_MIGRATION_CODE = 'runned';

export class DefaultRepository {
  protected readonly DEFAULT_MAPPING = { createdDate: MapperTypes.DATE_TIME, updatedDate: MapperTypes.DATE_TIME, monthYear: MapperTypes.IGNORE };
  public constructor(protected db: IDatabase) { }

  public async saveAll(tableName: TableNames, items: DefaultFields[]) {
    let allParams = {};
    let fullCommand = '';

    items.forEach((x, i) => {
      let execution = {} as any;

      if (x.id == null)
        execution = this.createInsertCommand(tableName, x, `${i}`);
      else
        execution = this.createUpdateCommand(tableName, x, `${i}`);

      const { command, params } = execution;

      fullCommand = `${fullCommand};${command}`
      allParams = { ...allParams, ...params }
    })

    console.debug('saveAll', fullCommand, allParams)

    this.db.exec(fullCommand, allParams);

    await this.persistDb();
  }

  public async save(tableName: TableNames, data: any) {
    let result = {} as any;

    if (data?.id != null)
      result = await this.update(tableName, data)
    else
      result = await this.insert(tableName, data);

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

    return this.parseSqlResultToObj(result, this.DEFAULT_MAPPING)[0] || [];
  }

  public async get<T>(tableName: TableNames, id: string): Promise<T> {
    await Promise.resolve();

    const result = await this.db.exec(`select * from ${tableName} where id = $id`, { "$id": id });

    if (result.length === 0)
      throw new Error(`${tableName} não encontrado (a)`);

    return this.parseSqlResultToObj(result, this.DEFAULT_MAPPING)[0][0];
  }

  protected async insert(tableName: TableNames, data: any) {
    const { command, params, nextData } = this.createInsertCommand(tableName, data);
    const fullCommand = `${command};SELECT LAST_INSERT_ROWID();`

    const result = await this.db.exec(fullCommand, params);

    nextData.id = result[0].values[0][0];

    return nextData;
  }

  protected createInsertCommand(tableName: TableNames, data: any, paramsPrefix: string = '') {
    const nextData = { ...data, createdDate: new Date() };
    const { keys, params } = this.parseToCommand(nextData, paramsPrefix);
    const command = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys.map(k => `$${k}${paramsPrefix}`).join(', ')})`;

    return { command, params, nextData }
  }

  protected async update(tableName: TableNames, data: any) {
    const { command, params } = this.createUpdateCommand(tableName, data);

    await this.db.exec(command, params);

    return this.get(tableName, data.id);
  }

  protected createUpdateCommand(tableName: TableNames, data: any, paramsPrefix: string = '') {
    const nextData = { ...data, updatedDate: new Date() };
    const { keys, params } = this.parseToCommand(nextData, paramsPrefix);
    const command = `UPDATE ${tableName} SET ${keys.map(k => `${k}=$${k}${paramsPrefix}`).join(', ')} WHERE id=$id${paramsPrefix}`;

    return { command, params, nextData }
  }

  protected parseSqlResultToObj(result: initSqlJs.QueryExecResult[], mapper?: { [key: string]: MapperTypes }) {
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
          } else if (mapper[n] === MapperTypes.BOOLEAN) {
            p[n] = !!value;
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

  protected parseToCommand(nextData: any, paramsPrefix: string = '') {
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

  protected async runMigrations() {
    await Promise.resolve();

    await this.db.exec(`CREATE TABLE IF NOT EXISTS "migrations" ("id" INTEGER NOT NULL,"name" TEXT NULL DEFAULT NULL,"executedDate" DATETIME NULL,PRIMARY KEY ("id"));`);

    const result = await this.db.exec('select * from "migrations"');
    const migrations = (this.parseSqlResultToObj(result)[0] || []).reduce((p, n) => { p[n.name] = n; return p; }, {} as any);

    if (migrations['parametros'] == null) {
      await this.db.exec(`CREATE TABLE IF NOT EXISTS "parametros" ("id" INTEGER NOT NULL,"chave" TEXT NOT NULL,"valor" TEXT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['parametros'] = RUNNED_MIGRATION_CODE;
    }

    if (migrations['acoes'] == null) {
      await this.db.exec(`CREATE TABLE IF NOT EXISTS "acoes" ("id" INTEGER NOT NULL,"nome" TEXT NOT NULL,"logo" TEXT NULL,"codigo" TEXT NULL, "tipo" INTEGER NULL, "active" INTEGER NULL, "valorDeMercado" REAL NULL, "setor" TEXT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['acoes'] = RUNNED_MIGRATION_CODE;
    }

    if (migrations['desativar_acoes'] == null) {
      await this.db.exec(`UPDATE acoes SET "active" = 0 WHERE 1 = 1;`);
      migrations['desativar_acoes'] = RUNNED_MIGRATION_CODE;
    }

    if (migrations['historico_acoes'] == null) {
      await this.db.exec(`CREATE TABLE IF NOT EXISTS "historico_acoes" ("id" INTEGER NOT NULL,"codigo" TEXT NOT NULL,"date" DATETIME NOT NULL,"open" REAL NOT NULL,"high" REAL NOT NULL,"low" REAL NOT NULL,"close" REAL NOT NULL,"adjustedClose" REAL NOT NULL,"volume" REAL NOT NULL,"intervalo" TEXT NOT NULL, "createdDate" DATETIME NOT NULL, "updatedDate" DATETIME NULL DEFAULT NULL,PRIMARY KEY ("id"));`);
      migrations['historico_acoes'] = RUNNED_MIGRATION_CODE;
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
    console.debug("persistDb ok");
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