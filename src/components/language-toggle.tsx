import { AnimatePresence, motion } from 'motion/react'
import { useIntl } from 'react-intl'
import { useI18n } from '~/lib/i18n/i18n'
import { LOCALE_LABELS } from '~/lib/i18n/messages'

export function LanguageToggle() {
  const { locale, toggleLocale } = useI18n()
  const intl = useIntl()

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={intl.formatMessage({ id: 'toggle.locale.next' })}
      className="relative grid h-8 w-9 place-items-center overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] font-semibold tracking-wider text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] focus-ring"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={locale}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 grid place-items-center"
          aria-hidden
        >
          {LOCALE_LABELS[locale]}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
