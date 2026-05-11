import type { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { DEFAULT_LOCALE, MESSAGES } from '~/lib/i18n/messages'
import { I18nProvider } from '~/lib/i18n/i18n'
import { ThemeProvider } from '~/lib/theme'

export function IntlTestProvider({ children }: { children: ReactNode }) {
  return (
    <IntlProvider
      locale={DEFAULT_LOCALE}
      defaultLocale={DEFAULT_LOCALE}
      messages={MESSAGES[DEFAULT_LOCALE]}
    >
      {children}
    </IntlProvider>
  )
}

export function AppTestProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  )
}
