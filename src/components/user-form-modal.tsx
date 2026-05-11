import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from 'sonner'
import {
  addRatedUserFn,
  updateRatedUserFn,
  type RatedUserDTO,
} from '~/lib/rated-users'

export type UserFormMode = 'add' | 'edit'

interface UserFormModalProps {
  open: boolean
  mode: UserFormMode
  initial?: RatedUserDTO | null
  onClose: () => void
}

const ease = [0.23, 1, 0.32, 1] as const

export function UserFormModal({
  open,
  mode,
  initial,
  onClose,
}: UserFormModalProps) {
  const intl = useIntl()
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'

  const [name, setName] = useState('')
  const [rating, setRating] = useState('50')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (isEdit && initial) {
      setName(initial.name)
      setRating(String(initial.rating))
    } else {
      setName('')
      setRating('50')
    }
    setError(null)
  }, [open, isEdit, initial])

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

  const mutation = useMutation<
    RatedUserDTO,
    Error,
    { name: string; rating: number }
  >({
    mutationFn: async (data) => {
      if (isEdit && initial) {
        return updateRatedUserFn({ data: { id: initial.id, ...data } })
      }
      return addRatedUserFn({ data })
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['rated-users'] })
      toast.success(
        intl.formatMessage({
          id: isEdit ? 'toast.userUpdated' : 'toast.userAdded',
        }),
        { description: `${result.name} (${result.rating})` },
      )
      onClose()
    },
    onError: (e) => setError(e.message),
  })

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
    if (mutation.isPending) return
    onClose()
  }

  if (typeof document === 'undefined') return null

  const titleId = isEdit ? 'editUser.title' : 'addUser.title'
  const subtitleId = isEdit ? 'editUser.subtitle' : 'addUser.subtitle'
  const submitId = mutation.isPending
    ? isEdit
      ? 'editUser.submitting'
      : 'addUser.submitting'
    : isEdit
      ? 'editUser.submit'
      : 'addUser.submit'

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
            aria-labelledby="user-form-title"
            className="relative w-[min(440px,92vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-fg)] shadow-2xl"
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.28, ease }}
          >
            <form onSubmit={onSubmit} noValidate>
              <div className="mb-5">
                <h2
                  id="user-form-title"
                  className="text-base font-semibold tracking-tight"
                >
                  <FormattedMessage id={titleId} />
                </h2>
                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                  <FormattedMessage id={subtitleId} />
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
                  disabled={mutation.isPending}
                  className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] disabled:opacity-60 focus-ring"
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
                  <FormattedMessage id={submitId} />
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
