"use client";

import React, { createContext, useState, useEffect } from "react"
import { brapiService } from "../services/brapi";
import { useStorage } from "./storage";
import { yahooService } from "../services/yahoo";

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