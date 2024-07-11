import { DB_CHANNEL, GestaoMessage } from "./common";

console.log('database-worker start');

const broadcast = new BroadcastChannel(DB_CHANNEL);
const worker = new Worker(`${process.env.PUBLIC_URL}/worker.sql-wasm.js`);

broadcast.addEventListener('message', event => {
  console.debug('database-broadcast.onmessage', event);

  worker.postMessage(event.data);
});

broadcast.addEventListener('messageerror', event => {
  console.error('database-broadcast.onmessage', event);
});

/* eslint-disable no-restricted-globals */

worker.onerror = e => console.log("Database worker error: ", e);
worker.onmessage = (event) => {
  console.debug('worker.sql-wasm.js.onmessage', event);


  if (event.data.id?.startsWith('sw-')) {
    console.log("HEREEE", event);

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
