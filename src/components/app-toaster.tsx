import { Toaster } from 'sonner'
import { useTheme } from '~/lib/theme'

export function AppToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '8px',
        },
      }}
    />
  )
}
