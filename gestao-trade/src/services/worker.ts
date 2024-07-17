import { WorkersActions } from "../workers/common";

export class WorkerService {
  private currentId = 0;
  private readonly worker: Worker;
  private readonly onMessages: { [key: string]: (event: MessageEvent) => void } = {};

  constructor(worker: Worker) {
    this.worker = worker;

    this.worker.onmessage = (event) => {
      const { id } = event.data;

      const action = this.onMessages[id];

      if (action == null) {
        console.error('invalid message id', id, event);

        throw new Error(`invalid message id => ${id} (pode ser que você esteja com outra tab aberta)`);
      }

      action(event);
      delete this.onMessages[id];
    }

    this.worker.onerror = e => console.log("Worker error: ", e);
  }

  protected async postMessageAndReceive(action: WorkersActions.LOAD_ALL, params?: any) {
    const nextId = `postMessageAndReceive-${this.currentId++}`;

    return new Promise((resolve, reject) => {
      this.onMessages[nextId] = event => {
        console.debug('WorkerService.onmessage', event.data.id, nextId, event);

        if (event.data.id === nextId) {
          if (event.data.error)
            reject(event.data);
          else
            resolve(event.data.response);
        }
      };

      this.worker.postMessage({
        id: nextId,
        action: action,
        params: params,
      });
    });
  }
}