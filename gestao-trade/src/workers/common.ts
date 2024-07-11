export enum WorkersActions {
  LOAD_ALL = "loadAll",
  CONNECT = "connect",
}


export interface GestaoMessage {
  id: number;
  action: WorkersActions;
  params: any;
}


export const DB_CHANNEL_SEND = 'gestao-database-channel-send';
export const DB_CHANNEL_RECEIVE = 'gestao-database-channel-receive';