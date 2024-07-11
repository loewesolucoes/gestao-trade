export enum WorkersActions {
  LOAD_ALL = "loadAll",
  CONNECT = "connect",
}


export interface GestaoMessage {
  id: number;
  action: WorkersActions;
  params: any;
}


export const DB_CHANNEL = 'gestao-database-channel';