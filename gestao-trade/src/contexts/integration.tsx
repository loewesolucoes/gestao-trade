"use client";

import React, { createContext, useState, useEffect } from "react"
import { BrapiService } from "../services/brapi";
import { useStorage } from "./storage";
import { YahooService } from "../services/yahoo";

const IntegrationContext = createContext({
  isRunning: true,
});

export function IntegrationProvider(props: any) {
  const { isDbOk } = useStorage();
  const [isRunning, setIsRunning] = useState(false);
  const [brapiService, setBrapiService] = useState<BrapiService>();
  const [yahooService, setYahooService] = useState<YahooService>();

  useEffect(() => {
    if (isDbOk) {
      setBrapiService(new BrapiService());
      setYahooService(new YahooService());
    }
  }, [isDbOk]);

  useEffect(() => {
    load();
  }, [brapiService, yahooService]);

  async function load() {
    if (brapiService == null || yahooService == null) return;

    await brapiService.loadAll();
    await yahooService.loadAll();
    setIsRunning(false);
  }

  return (
    <IntegrationContext.Provider
      value={{
        isRunning,
      }}
      {...props}
    />
  )
}

export const useIntegration = () => React.useContext(IntegrationContext)