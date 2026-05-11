import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { IntlProvider } from 'react-intl'
import {
  DEFAULT_LOCALE,
  MESSAGES,
  SUPPORTED_LOCALES,
  type Locale,
} from './messages'

const STORAGE_KEY = 'app-locale'

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readInitialLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const attr = document.documentElement.getAttribute('data-locale')
  if (attr && (SUPPORTED_LOCALES as readonly string[]).includes(attr)) {
    return attr as Locale
  }
  return DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale)

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('data-locale', locale)
    try {
      localStorage.setItem(STORAGE_KEY, locale)
      document.cookie = `${STORAGE_KEY}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    } catch {
      // storage blocked, ignore
    }
  }, [locale])

  const value: I18nContextValue = {
    locale,
    setLocale: setLocaleState,
    toggleLocale: () =>
      setLocaleState((current) => {
        const idx = SUPPORTED_LOCALES.indexOf(current)
        const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length]
        return next ?? DEFAULT_LOCALE
      }),
  }

  return (
    <I18nContext.Provider value={value}>
      <IntlProvider
        locale={locale}
        defaultLocale={DEFAULT_LOCALE}
        messages={MESSAGES[locale]}
      >
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>.')
  return ctx
}

export const localeInitScript = `(() => {
  try {
    var l = localStorage.getItem('${STORAGE_KEY}');
    if (l !== 'en' && l !== 'uk') {
      var nav = (navigator.language || 'en').toLowerCase();
      l = nav.indexOf('uk') === 0 ? 'uk' : 'en';
    }
    document.documentElement.setAttribute('lang', l);
    document.documentElement.setAttribute('data-locale', l);
  } catch (e) {
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('data-locale', 'en');
  }
})();`
