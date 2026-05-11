import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from 'sonner'
import type { CurrentUser } from '~/lib/auth'
import { logoutFn } from '~/lib/auth'
import { ThemeToggle } from './theme-toggle'
import { LanguageToggle } from './language-toggle'
import { ConfirmDialog } from './confirm-dialog'

interface HeaderProps {
  user: CurrentUser
  onAddUser: () => void
}

export function Header({ user, onAddUser }: HeaderProps) {
  const router = useRouter()
  const intl = useIntl()
  const isAdmin = user.role === 'ADMIN'
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleConfirmSignOut() {
    setSigningOut(true)
    try {
      await logoutFn()
      toast.success(intl.formatMessage({ id: 'toast.signedOut' }))
      await router.invalidate()
      await router.navigate({ to: '/login' })
    } finally {
      setSigningOut(false)
      setConfirmOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1] }}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <div className="flex items-center gap-3">
          <div
            className="grid size-7 place-items-center rounded-md bg-[var(--color-accent)] text-[10px] font-bold text-[var(--color-accent-fg)]"
            aria-hidden
          >
            D
          </div>
          <div className="text-sm font-semibold tracking-tight">
            <FormattedMessage id="app.title" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <motion.button
              type="button"
              onClick={onAddUser}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] focus-ring"
            >
              <FormattedMessage id="header.addUser" />
            </motion.button>
          ) : null}

          <div className="hidden text-right sm:block">
            <div className="text-xs text-[var(--color-fg)]">{user.email}</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
              {user.role}
            </div>
          </div>

          <LanguageToggle />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] focus-ring"
          >
            <FormattedMessage id="header.signOut" />
          </button>
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        title={intl.formatMessage({ id: 'header.confirm.title' })}
        description={
          <>
            <FormattedMessage id="header.confirm.desc.prefix" />
            <span className="text-[var(--color-fg)]">{user.email}</span>
            <FormattedMessage id="header.confirm.desc.suffix" />
          </>
        }
        confirmLabel={intl.formatMessage({ id: 'header.signOut' })}
        cancelLabel={intl.formatMessage({ id: 'addUser.cancel' })}
        tone="danger"
        pending={signingOut}
        onCancel={() => (signingOut ? undefined : setConfirmOpen(false))}
        onConfirm={handleConfirmSignOut}
      />
    </header>
  )
}
