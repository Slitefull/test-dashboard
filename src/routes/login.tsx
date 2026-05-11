import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getCurrentUserFn, loginFn } from '~/lib/auth'
import { ThemeToggle } from '~/components/theme-toggle'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const user = await getCurrentUserFn()
    if (user) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const result = await loginFn({ data: { email, password } })
      if (!result.ok) {
        setError(result.error)
        setPending(false)
        return
      }
      await router.invalidate()
      await router.navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
      setPending(false)
    }
  }

  const ease = [0.23, 1, 0.32, 1] as const

  return (
    <main className="relative min-h-screen grid place-items-center px-4">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="w-full max-w-sm"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
          }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, ease }}
            className="mb-10"
          >
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--color-fg-subtle)]">
              <span className="inline-block size-1.5 rounded-full bg-[var(--color-accent)]" />
              Dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Sign in to continue
            </h1>
            <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
              Use a seeded account below.
            </p>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            noValidate
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, ease }}
            className="space-y-4"
          >
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />

            <AnimatePresence>
              {error ? (
                <motion.div
                  key="err"
                  role="alert"
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.22, ease }}
                  className="overflow-hidden"
                >
                  <div className="rounded-md border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                    {error}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={pending}
              whileHover={{ scale: pending ? 1 : 1.01 }}
              whileTap={{ scale: pending ? 1 : 0.99 }}
              transition={{ duration: 0.15, ease }}
              className="w-full rounded-md bg-[var(--color-accent)] px-3 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] hover:brightness-110 disabled:opacity-60 focus-ring"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </motion.form>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, ease }}
            className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-fg-muted)]"
          >
            <div className="mb-3 font-medium uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Test accounts
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 tabular-nums">
              <dt className="text-[var(--color-accent)]">admin</dt>
              <dd className="text-[var(--color-fg)]">admin@example.com / admin123</dd>
              <dt className="text-[var(--color-fg-subtle)]">user</dt>
              <dd className="text-[var(--color-fg)]">user@example.com / user123</dd>
            </dl>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  )
}

interface FieldProps {
  label: string
  type: 'email' | 'password' | 'text'
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  required?: boolean
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus-ring transition focus:border-[var(--color-accent)]"
      />
    </label>
  )
}
