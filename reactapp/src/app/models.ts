"use client";
export interface StockSearchResponse {
  success: boolean;
  data: { stocks: Stock[]; total: number; };
}

export interface Stock {
  id: string;
  code: string;
  name: string;
  active: boolean;
  type: string;
  logo: string;
  marketCap?: number;
  sector?: string;
}

export interface StockHistoryResponse {
  success: boolean;
  data: History[];
}

export interface History {
  id: number;
  open: number;
  close: number;
  adjustedClose: number;
  max: number;
  min: number;
  volume: number;
  date: Date;
  interval: Interval;
  stockId: string;
  stock: null;
}

export interface ChartIntraday {
  time: string,
  open: number,
  close: number,
  high: number,
  low: number,
}

export enum Interval {
  Daily = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}