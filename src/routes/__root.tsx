/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import appCss from '~/styles/app.css?url'
import { ThemeProvider, themeInitScript } from '~/lib/theme'
import { I18nProvider, localeInitScript } from '~/lib/i18n/i18n'
import { AppToaster } from '~/components/app-toaster'

interface RouterAppContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Dashboard' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [{ children: themeInitScript }, { children: localeInitScript }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider>
        <I18nProvider>
          <Outlet />
          <AppToaster />
        </I18nProvider>
      </ThemeProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
