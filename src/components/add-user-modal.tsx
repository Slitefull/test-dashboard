import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from 'sonner'
import { addRatedUserFn } from '~/lib/rated-users'
import type { RatedUserDTO } from '~/lib/rated-users'

interface AddUserModalProps {
  open: boolean
  onClose: () => void
}

const ease = [0.23, 1, 0.32, 1] as const

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const intl = useIntl()
  const [name, setName] = useState('')
  const [rating, setRating] = useState('50')
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation<
    RatedUserDTO,
    Error,
    { name: string; rating: number }
  >({
    mutationFn: (data) => addRatedUserFn({ data }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['rated-users'] })
      toast.success(intl.formatMessage({ id: 'toast.userAdded' }), {
        description: `${created.name} (${created.rating})`,
      })
      reset()
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  function reset() {
    setName('')
    setRating('50')
    setError(null)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const parsed = Number(rating)
    if (!name.trim()) {
      setError(intl.formatMessage({ id: 'addUser.error.nameRequired' }))
      return
    }
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setError(intl.formatMessage({ id: 'addUser.error.ratingRange' }))
      return
    }
    mutation.mutate({ name: name.trim(), rating: parsed })
  }

  function onCancel() {
    reset()
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 grid place-items-center px-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="absolute inset-0 bg-black/55"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.22, ease }}
            onClick={onCancel}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="relative w-[min(440px,92vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-fg)] shadow-2xl"
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.28, ease }}
          >
            <form onSubmit={onSubmit} noValidate>
              <div className="mb-5">
                <h2 id="add-user-title" className="text-base font-semibold tracking-tight">
                  <FormattedMessage id="addUser.title" />
                </h2>
                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                  <FormattedMessage id="addUser.subtitle" />
                </p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
                    <FormattedMessage id="addUser.field.name" />
                  </span>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    maxLength={120}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm placeholder:text-[var(--color-fg-subtle)] focus-ring transition focus:border-[var(--color-accent)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
                    <FormattedMessage id="addUser.field.rating" />{' '}
                    <span className="text-[var(--color-fg-subtle)]">
                      <FormattedMessage id="addUser.field.ratingHint" />
                    </span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus-ring transition focus:border-[var(--color-accent)]"
                  />
                </label>

                <AnimatePresence>
                  {error ? (
                    <motion.div
                      key="err"
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-md border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-3 py-2 text-xs text-[var(--color-danger)]">
                        {error}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] focus-ring"
                >
                  <FormattedMessage id="addUser.cancel" />
                </button>
                <motion.button
                  type="submit"
                  disabled={mutation.isPending}
                  whileHover={{ scale: mutation.isPending ? 1 : 1.02 }}
                  whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
                  transition={{ duration: 0.15, ease }}
                  className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] hover:brightness-110 disabled:opacity-60 focus-ring"
                >
                  <FormattedMessage
                    id={mutation.isPending ? 'addUser.submitting' : 'addUser.submit'}
                  />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
