import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'accent' | 'danger'
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const ease = [0.23, 1, 0.32, 1] as const

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'accent',
  pending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !pending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onCancel, pending])

  if (typeof document === 'undefined') return null

  const confirmBg =
    tone === 'danger' ? 'var(--color-danger)' : 'var(--color-accent)'
  const confirmFg =
    tone === 'danger' ? 'oklch(0.99 0.005 28)' : 'var(--color-accent-fg)'

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 grid place-items-center px-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/55"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.22, ease }}
            onClick={pending ? undefined : onCancel}
            aria-hidden
          />
          <motion.div
            className="relative w-[min(380px,92vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-fg)] shadow-2xl"
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.26, ease }}
          >
            <h2 id="confirm-title" className="text-base font-semibold tracking-tight">
              {title}
            </h2>
            {description ? (
              <div className="mt-2 text-sm text-[var(--color-fg-muted)]">
                {description}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] disabled:opacity-60 focus-ring"
              >
                {cancelLabel}
              </button>
              <motion.button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                whileHover={{ scale: pending ? 1 : 1.02 }}
                whileTap={{ scale: pending ? 1 : 0.98 }}
                transition={{ duration: 0.15, ease }}
                style={{ background: confirmBg, color: confirmFg }}
                className="rounded-md px-3 py-1.5 text-xs font-medium hover:brightness-110 disabled:opacity-60 focus-ring"
              >
                {pending ? 'Working…' : confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
