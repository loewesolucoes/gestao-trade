import { IDatabase } from "../repositories/database";

const DB_CHANNEL_SEND = `gestao-database-channel-send`;
const DB_CHANNEL_RECEIVE = `gestao-database-channel-receive`;

export class WorkerDatabase implements IDatabase {
  private static readonly broadcastSend: BroadcastChannel = new BroadcastChannel(DB_CHANNEL_SEND);
  private static readonly broadcastReceive: BroadcastChannel = new BroadcastChannel(DB_CHANNEL_RECEIVE);
  private static readonly onMessages: ((event: MessageEvent) => void)[] = [];
  private static readonly onExecMessages: { [key: string]: (event: MessageEvent) => void } = {};
  private currentId = 0;

  public static _init() {
    WorkerDatabase.broadcastSend.onmessage = (event) => {
      WorkerDatabase.onMessages.forEach(x => x(event));
    }

    WorkerDatabase.broadcastSend.onmessageerror = (event) => {
      console.error('WorkerDatabase.onmessageerror', event);
    }

    WorkerDatabase.broadcastReceive.onmessage = (event) => {
      const { id } = event.data;
      const action = this.onExecMessages[id];

      if (action == null) {
        // se estiver dando erro nessa parte deve ser devido a possuir duas tabs abertas
        console.debug('invalid message id', id, event);

        return;
      }

      action(event);
      delete this.onExecMessages[id];
    }

    WorkerDatabase.broadcastReceive.onmessageerror = (event) => {
      console.error('WorkerDatabase.onmessageerror', event);
    }
  }

  constructor(private workerName: string) { }

  public static setOnMessage(action: (e: MessageEvent) => void) {
    this.onMessages.push(action);
  }

  public static postReceive(event: MessageEvent) {
    WorkerDatabase.broadcastReceive.postMessage(event.data);
  }

  public async exec(sql: string, params?: any): Promise<initSqlJs.QueryExecResult[]> {
    const nextId = `sw-${this.workerName}-exec-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      WorkerDatabase.onExecMessages[nextId] = event => {
        console.debug('WorkerDatabase.onmessage', event.data.id, nextId, event);

        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data.results);
        }
      };

      console.debug('WorkerDatabase.sending', 'exec', nextId, sql, params);

      WorkerDatabase.broadcastSend.postMessage({
        id: nextId,
        action: "exec",
        sql: sql,
        params: params
      });
    });
  }

  public async export(): Promise<Uint8Array> {
    const nextId = `sw-${this.workerName}-export-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      WorkerDatabase.onExecMessages[nextId] = event => {
        console.debug('WorkerDatabase.onmessage', event.data.id, nextId, event);

        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data.buffer);
        }
      };

      console.debug('WorkerDatabase.sending', 'export', nextId);

      WorkerDatabase.broadcastSend.postMessage({
        id: nextId,
        action: "export",
      });
    });
  }

  public async open(data?: Buffer | ArrayLike<number> | null | undefined): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

WorkerDatabase._init();