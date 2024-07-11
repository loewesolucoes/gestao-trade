"use client";

import React, { createContext, useState, useEffect } from "react"
import { brapiService } from "../services/brapi";

const IntegrationContext = createContext({
  isRunning: true,
});

export function IntegrationProvider(props: any) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    await brapiService.loadAll();
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