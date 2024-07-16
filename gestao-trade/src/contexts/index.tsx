import { AuthProvider } from "./auth"
import { EnvProvider } from "./env"
import { IntegrationProvider } from "./integration"
import { NotificationProvider } from "./notification"
import { StorageProvider } from "./storage"

export function AppProviders({ children }: any) {
  return (
    <EnvProvider>
      <NotificationProvider>
        <AuthProvider>
          <StorageProvider>
            <IntegrationProvider>
              {children}
            </IntegrationProvider>
          </StorageProvider>
        </AuthProvider>
      </NotificationProvider>
    </EnvProvider>
  )
}