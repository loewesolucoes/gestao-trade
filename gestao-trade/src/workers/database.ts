import { DB_CHANNEL_SEND, GestaoMessage } from "./common";
import { DBWorkerUtil } from "./db-worker-util";

console.log('database-worker start');

const worker = new Worker(`${process.env.PUBLIC_URL}/worker.sql-wasm.js`);

DBWorkerUtil.setOnMessage(event => {
  console.debug('database-broadcast.onmessage', event);

  worker.postMessage(event.data);
})

/* eslint-disable no-restricted-globals */

worker.onerror = e => console.log("Database worker error: ", e);
worker.onmessage = (event) => {
  console.debug('worker.sql-wasm.js.onmessage', event);

  if (event.data.id?.startsWith('sw-')) {
    console.log("HEREEE", event);

    DBWorkerUtil.postReceive(event);
  } else {
    self.postMessage(event.data);
  }
}

self.onmessage = (event: MessageEvent<GestaoMessage>) => {
  console.debug('database.onmessage', event);

  worker.postMessage(event.data);
};

console.log('database-worker end');

export { };
