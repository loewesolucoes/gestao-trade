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

  useEffect(() => {
    isDbOk && load();
  }, [isDbOk]);

  async function load() {
    const brapiService = new BrapiService();
    const yahooService = new YahooService();

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