import { AuthProvider } from "./auth"
import { EnvProvider } from "./env"
import { StorageProvider } from "./storage"

export function AppProviders({ children }: any) {
  return (
    <EnvProvider>
      <AuthProvider>
        <StorageProvider>
          {children}
        </StorageProvider>
      </AuthProvider>
    </EnvProvider>
  )
}