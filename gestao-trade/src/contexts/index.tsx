import { EnvProvider } from "./env"

export function AppProviders({ children }: any) {
  return (
    <EnvProvider>
      {children}
    </EnvProvider>
  )
}