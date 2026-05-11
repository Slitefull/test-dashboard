import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useIntl } from 'react-intl'

interface RowActionsProps {
  onEdit: () => void
  onDelete: () => void
}

const ease = [0.23, 1, 0.32, 1] as const

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  const intl = useIntl()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(handler: () => void) {
    setOpen(false)
    handler()
  }

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={intl.formatMessage({ id: 'row.actions.label' })}
        onClick={() => setOpen((v) => !v)}
        className="grid size-7 place-items-center rounded-md text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)] focus-ring"
      >
        <DotsIcon />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease }}
            className="absolute right-0 top-full z-20 mt-1 w-36 origin-top-right overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => pick(onEdit)}
              className="block w-full px-3 py-2 text-left text-xs text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            >
              {intl.formatMessage({ id: 'row.actions.edit' })}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => pick(onDelete)}
              className="block w-full border-t border-[var(--color-border)]/60 px-3 py-2 text-left text-xs text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10 focus-ring"
            >
              {intl.formatMessage({ id: 'row.actions.delete' })}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function DotsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
