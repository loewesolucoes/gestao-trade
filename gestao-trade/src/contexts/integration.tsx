"use client";

import React, { createContext, useState, useEffect } from "react"
import { BrapiService } from "../services/brapi";
import { useStorage } from "./storage";
import { YahooService } from "../services/yahoo";
import { NotificationUtil } from "../utils/notification";

const IntegrationContext = createContext({
  isRunningAll: false,
  isLoadingIntegration: true,
  loadAll: () => console.warn('not load yet'),
});

export function IntegrationProvider(props: any) {
  const { isDbOk } = useStorage();
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(true);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [brapiService, setBrapiService] = useState<BrapiService>();
  const [yahooService, setYahooService] = useState<YahooService>();

  useEffect(() => {
    if (isDbOk) {
      setBrapiService(new BrapiService());
      setYahooService(new YahooService());
    }
  }, [isDbOk]);

  useEffect(() => {
    if (brapiService == null || yahooService == null) return;

    setIsLoadingIntegration(false);
  }, [brapiService, yahooService]);

  async function loadAll() {
    setIsRunningAll(true);

    await loadBrapi();
    await loadYahoo();

    setIsRunningAll(false);
  }

  async function loadYahoo() {
    if (yahooService == null) return NotificationUtil.send('Ainda não carregou as integrações');

    await yahooService.loadAll();
  }

  async function loadBrapi() {
    if (brapiService == null) return NotificationUtil.send('Ainda não carregou as integrações');

    await brapiService.loadAll();
  }

  return (
    <IntegrationContext.Provider
      value={{
        isRunningAll,
        isLoadingIntegration,
        loadAll,
      }}
      {...props}
    />
  )

}

export const useIntegration = () => React.useContext(IntegrationContext)