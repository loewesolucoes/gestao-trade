import localforage from 'localforage'
import { Buffer } from 'buffer';
import { DefaultRepository } from '../repositories/default';

const BUFFER_TYPE = 'base64';

export class Database {
  private currentId = 0;
  private readonly worker: Worker;

  constructor() {
    this.worker = new Worker(`${process.env.PUBLIC_URL}/worker.sql-wasm.js`);

    this.worker.onerror = e => console.log("Worker error: ", e);
  }

  public async exec(sql: string, params?: any): Promise<initSqlJs.QueryExecResult[]> {
    const nextId = `exec-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      this.worker.onmessage = event => {
        console.log(event); // The result of the query

        console.log(event.data.id, nextId);

        if (event.data.id === nextId)
          resolve(event.data.results);
      };

      console.log('sending', sql, params);

      this.worker.postMessage({
        id: nextId,
        action: "exec",
        sql: sql,
        params: params
      });
    });
  }

  public async export(): Promise<Uint8Array> {
    const nextId = `export-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      this.worker.onmessage = event => {
        console.log(event); // The result of the query
        console.log(event.data.id, nextId);
        if (event.data.id === nextId)
          resolve(event.data.buffer);
      };

      console.log('sending', 'export');

      this.worker.postMessage({
        id: nextId,
        action: "export",
      });
    });
  }

  public async open(data?: ArrayLike<number> | Buffer | null): Promise<any> {
    const nextId = `open-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      this.worker.onmessage = event => {
        console.log(event); // The result of the query
        console.log(event.data.id, nextId);
        if (event.data.id === nextId)
          resolve(event.data);
      };

      console.log('sending', 'open');

      this.worker.postMessage({
        id: nextId,
        action: "open",
        buffer: data, /*Optional. An ArrayBuffer representing an SQLite Database file*/
      });
    });
  }
}

export class RepositoryUtil {
  public static readonly DB_NAME = 'gestao-trade.settings.db';

  public static async create(data?: ArrayLike<number> | Buffer | null) {
    const localDump = await RepositoryUtil.exportLocalDump();

    if (data == null && localDump != null) {
      data = Buffer.from(localDump, BUFFER_TYPE);
    }

    const db = new Database();

    await db.open(data);

    const repo = new DefaultRepository(db);

    // @ts-ignore
    await repo.runMigrations();

    if (process.env.NODE_ENV !== 'production') {
      //@ts-ignore
      window._db = db;
    }

    // repo.beforeClose();

    return repo;
  }

  public static async persistLocalDump(dump?: string): Promise<void> {
    await localforage.setItem(RepositoryUtil.DB_NAME, dump || '');
  }

  public static async exportLocalDump(): Promise<string | null> {
    return await localforage.getItem<string>(RepositoryUtil.DB_NAME);
  }

  public static generateDumpFromExport(exp: Uint8Array) {
    return Buffer.from(exp).toString(BUFFER_TYPE);
  }
}