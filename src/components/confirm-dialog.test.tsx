import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './confirm-dialog'

function setup(overrides: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const onCancel = vi.fn()
  const onConfirm = vi.fn()
  const utils = render(
    <ConfirmDialog
      open={true}
      title="Sign out?"
      description="You will be signed out."
      confirmLabel="Sign out"
      tone="danger"
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...overrides}
    />,
  )
  return { onCancel, onConfirm, ...utils }
}

describe('ConfirmDialog', () => {
  it('renders title + description + buttons when open', () => {
    setup()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Sign out?')).toBeInTheDocument()
    expect(screen.getByText('You will be signed out.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Sign out?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('calls onConfirm when confirm clicked', async () => {
    const user = userEvent.setup()
    const { onConfirm } = setup()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = setup()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel on Escape key', async () => {
    const user = userEvent.setup()
    const { onCancel } = setup()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })

  it('blocks confirm + cancel + escape when pending', async () => {
    const user = userEvent.setup()
    const { onCancel, onConfirm } = setup({ pending: true })
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelBtn).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onCancel).not.toHaveBeenCalled()
    const confirmBtn = screen.getByRole('button', { name: 'Working…' })
    expect(confirmBtn).toBeDisabled()
    await user.click(confirmBtn)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('locks body scroll while open', () => {
    setup()
    expect(document.body.style.overflow).toBe('hidden')
  })
})
