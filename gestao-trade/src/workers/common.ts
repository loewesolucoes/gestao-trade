export enum WorkersActions {
  LOAD_ALL = "loadAll"
}


export interface GestaoMessage {
  id: number;
  action: WorkersActions;
  params: any;
}
