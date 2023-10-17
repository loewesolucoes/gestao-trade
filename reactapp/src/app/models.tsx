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
