import { GestaoMessage } from "./common";
import { DBWorkerUtil } from "./db-worker-util";

console.log('database-broadcast-worker start');

const worker = new Worker(`${process.env.PUBLIC_URL}/worker.sql-wasm.js`);

DBWorkerUtil.setOnMessage(event => {
  console.debug('database-broadcast.onmessage', event);

  worker.postMessage(event.data);
})

/* eslint-disable no-restricted-globals */

worker.onerror = e => console.error("Database worker error: ", e);
worker.onmessage = (event) => {
  console.debug('database-broadcast.onmessage', event);

  if (event.data.id?.startsWith('sw-')) {
    DBWorkerUtil.postReceive(event);
  } else {
    self.postMessage(event.data);
  }
}

self.onmessage = (event: MessageEvent<GestaoMessage>) => {
  console.debug('database.onmessage', event);

  worker.postMessage(event.data);
};

console.log('database-broadcast-worker end');

export { };
