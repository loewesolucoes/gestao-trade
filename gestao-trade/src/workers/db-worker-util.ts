import { DB_CHANNEL_RECEIVE, DB_CHANNEL_SEND } from "./common";

export class DBWorkerUtil {
  private static readonly broadcastSend: BroadcastChannel = new BroadcastChannel(DB_CHANNEL_SEND);
  private static readonly broadcastReceive: BroadcastChannel = new BroadcastChannel(DB_CHANNEL_RECEIVE);
  private static readonly onMessages: ((event: MessageEvent) => void)[] = [];
  private static readonly onExecMessages: { [key: string]: (event: MessageEvent) => void } = {};
  private currentId = 0;

  public static _init() {
    DBWorkerUtil.broadcastSend.onmessage = (event) => {
      DBWorkerUtil.onMessages.forEach(x => x(event));
    }

    DBWorkerUtil.broadcastSend.onmessageerror = (event) => {
      console.error('DBWorkerUtil.onmessageerror', event);
    }

    DBWorkerUtil.broadcastReceive.onmessage = (event) => {
      const { id } = event.data;
      const action = this.onExecMessages[id];

      if (action == null) {
        console.error('invalid message id', id, event);

        throw new Error(`invalid message id => ${id}`);
      }

      action(event);
      delete this.onExecMessages[id];
    }

    DBWorkerUtil.broadcastReceive.onmessageerror = (event) => {
      console.error('DBWorkerUtil.onmessageerror', event);
    }
  }

  constructor(private workerName: string) { }

  public static setOnMessage(action: (e: MessageEvent) => void) {
    this.onMessages.push(action);
  }

  public static postReceive(event: MessageEvent) {
    DBWorkerUtil.broadcastReceive.postMessage(event.data);
  }

  public async exec(sql: string, params?: any): Promise<initSqlJs.QueryExecResult[]> {
    const nextId = `sw-${this.workerName}-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      DBWorkerUtil.onExecMessages[nextId] = event => {
        console.debug('DBWorkerUtil.onmessage', event.data.id, nextId, event);

        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data.results);
        }
      };

      console.debug('DBWorkerUtil.sending', 'exec', nextId, sql, params);

      DBWorkerUtil.broadcastSend.postMessage({
        id: nextId,
        action: "exec",
        sql: sql,
        params: params
      });
    });
  }
}

DBWorkerUtil._init();