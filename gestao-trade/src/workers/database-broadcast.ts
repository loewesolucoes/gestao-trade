import { GestaoMessage } from "./common";
import { WorkerDatabase } from "./worker-database";

console.debug('database-broadcast-worker start');

const worker = new Worker(process.env.NODE_ENV === 'development' ? `${process.env.PUBLIC_URL}/worker.sql-wasm-debug.js` : `${process.env.PUBLIC_URL}/worker.sql-wasm.js`);
// const worker = new Worker((new URL("sql.js/dist/worker.sql-wasm.js", import.meta.url)));

WorkerDatabase.setOnMessage(event => {
  console.debug('database-broadcast.setOnMessage', event);

  worker.postMessage(event.data);
})

/* eslint-disable no-restricted-globals */

worker.onerror = e => console.error("Database worker error: ", e);
worker.onmessage = (event) => {
  console.debug('database-broadcast.onmessage', event);

  if (event.data.id?.startsWith('sw-')) {
    WorkerDatabase.postReceive(event);
  } else {
    self.postMessage(event.data);
  }
}

self.onmessage = (event: MessageEvent<GestaoMessage>) => {
  console.debug('database.onmessage', event);

  worker.postMessage(event.data);
};

console.debug('database-broadcast-worker end');

export { };
