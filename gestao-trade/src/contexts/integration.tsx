"use client";

import React, { createContext, useState, useEffect } from "react"

const IntegrationContext = createContext({
  isRunning: true,
})

export function IntegrationProvider(props: any) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(false);
  }, []);

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