import { AuthProvider } from "./auth"
import { EnvProvider } from "./env"
import { IntegrationProvider } from "./integration"
import { StorageProvider } from "./storage"

export function AppProviders({ children }: any) {
  return (
    <EnvProvider>
      <AuthProvider>
        <StorageProvider>
          <IntegrationProvider>
            {children}
          </IntegrationProvider>
        </StorageProvider>
      </AuthProvider>
    </EnvProvider>
  )
}