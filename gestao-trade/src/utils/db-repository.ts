import localforage from 'localforage'
import { Buffer } from 'buffer';
import { DefaultRepository } from '../repositories/default-repository';

const BUFFER_TYPE = 'base64';

export class GestaoDatabase {
  private currentId = 0;
  private readonly worker: Worker;
  private readonly onMessages: { [key: string]: (event: MessageEvent) => void } = {};

  constructor() {
    this.worker = new Worker(new URL("../workers/database.ts", import.meta.url));
    this.worker.onerror = e => console.log("Worker error: ", e);
    this.worker.onmessage = (event) => {
      const { id } = event.data;

      if (id?.startsWith('sw')) return;

      const action = this.onMessages[id];

      if (action == null) {
        console.error('invalid message id', id, event);

        throw new Error(`invalid message id => ${id}`);
      }

      action(event);
      delete this.onMessages[id];
    }
  }

  public async exec(sql: string, params?: any): Promise<initSqlJs.QueryExecResult[]> {
    const nextId = `exec-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      this.onMessages[nextId] = event => {
        console.debug('onmessage', event.data.id, nextId, event);

        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data.results);
        }
      };

      console.debug('sending', 'exec', nextId, sql, params);

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
      this.onMessages[nextId] = event => {
        console.debug('onmessage', event.data.id, nextId, event);
        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data.buffer);
        }
      };

      console.debug('sending', 'export', nextId);

      this.worker.postMessage({
        id: nextId,
        action: "export",
      });
    });
  }

  public async open(data?: ArrayLike<number> | Buffer | null): Promise<any> {
    const nextId = `open-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      this.onMessages[nextId] = event => {
        console.debug('onmessage', event.data.id, nextId, event);
        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data);
        }
      };

      console.debug('sending', 'open', nextId);

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

    const db = new GestaoDatabase();

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