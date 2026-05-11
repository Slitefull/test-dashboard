import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const hoisted = vi.hoisted(() => ({
  addRatedUserFn: vi.fn(),
  toastSuccess: vi.fn(),
}))
const { addRatedUserFn, toastSuccess } = hoisted

vi.mock('~/lib/rated-users', () => ({
  addRatedUserFn: hoisted.addRatedUserFn,
}))

vi.mock('sonner', () => ({
  toast: { success: hoisted.toastSuccess },
}))

import { AddUserModal } from './add-user-modal'

function renderModal(onClose = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AddUserModal open={true} onClose={onClose} />
    </QueryClientProvider>,
  )
  return { onClose, queryClient, ...utils }
}

describe('AddUserModal', () => {
  beforeEach(() => {
    addRatedUserFn.mockReset()
    toastSuccess.mockReset()
  })

  it('renders form fields when open', () => {
    renderModal()
    expect(
      screen.getByRole('heading', { name: 'Add user' }),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument()
  })

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: 'Add user' }))
    expect(await screen.findByText('Name is required.')).toBeInTheDocument()
    expect(addRatedUserFn).not.toHaveBeenCalled()
  })

  it('shows validation error for rating out of range', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.type(screen.getByPlaceholderText('Jane Doe'), 'Alice')
    const ratingInput = screen.getByRole('spinbutton')
    await user.clear(ratingInput)
    await user.type(ratingInput, '150')
    await user.click(screen.getByRole('button', { name: 'Add user' }))
    expect(
      await screen.findByText('Rating must be between 0 and 100.'),
    ).toBeInTheDocument()
    expect(addRatedUserFn).not.toHaveBeenCalled()
  })

  it('submits valid input and closes on success', async () => {
    const user = userEvent.setup()
    addRatedUserFn.mockResolvedValueOnce({
      id: 'x1',
      name: 'Alice',
      rating: 80,
      createdAt: new Date().toISOString(),
    })
    const onClose = vi.fn()
    renderModal(onClose)
    await user.type(screen.getByPlaceholderText('Jane Doe'), 'Alice')
    const ratingInput = screen.getByRole('spinbutton')
    await user.clear(ratingInput)
    await user.type(ratingInput, '80')
    await user.click(screen.getByRole('button', { name: 'Add user' }))
    await waitFor(() =>
      expect(addRatedUserFn).toHaveBeenCalledWith({
        data: { name: 'Alice', rating: 80 },
      }),
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(toastSuccess).toHaveBeenCalledWith(
      'User added',
      expect.objectContaining({ description: expect.stringContaining('Alice') }),
    )
  })

  it('surfaces server error', async () => {
    const user = userEvent.setup()
    addRatedUserFn.mockRejectedValueOnce(new Error('Forbidden'))
    renderModal()
    await user.type(screen.getByPlaceholderText('Jane Doe'), 'Alice')
    await user.click(screen.getByRole('button', { name: 'Add user' }))
    expect(await screen.findByText('Forbidden')).toBeInTheDocument()
  })

  it('cancel button closes without submitting', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(onClose)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
    expect(addRatedUserFn).not.toHaveBeenCalled()
  })
})
