import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const logoutFn = vi.fn()
const invalidate = vi.fn().mockResolvedValue(undefined)
const navigate = vi.fn().mockResolvedValue(undefined)

vi.mock('~/lib/auth', () => ({
  logoutFn: (...args: unknown[]) => logoutFn(...args),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate, navigate }),
}))

import { Header } from './header'
import { ThemeProvider } from '~/lib/theme'
import type { CurrentUser } from '~/lib/auth'

function renderHeader(role: CurrentUser['role'], onAddUser = vi.fn()) {
  const user: CurrentUser = {
    id: 'u1',
    email: 'someone@example.com',
    role,
  }
  return {
    onAddUser,
    user,
    ...render(
      <ThemeProvider>
        <Header user={user} onAddUser={onAddUser} />
      </ThemeProvider>,
    ),
  }
}

describe('Header', () => {
  beforeEach(() => {
    logoutFn.mockReset().mockResolvedValue({ ok: true })
    invalidate.mockReset().mockResolvedValue(undefined)
    navigate.mockReset().mockResolvedValue(undefined)
  })

  it('shows Add user button for ADMIN', () => {
    renderHeader('ADMIN')
    expect(
      screen.getByRole('button', { name: '+ Add user' }),
    ).toBeInTheDocument()
  })

  it('hides Add user button for non-admin', () => {
    renderHeader('USER')
    expect(
      screen.queryByRole('button', { name: '+ Add user' }),
    ).not.toBeInTheDocument()
  })

  it('clicking Add user calls onAddUser', async () => {
    const user = userEvent.setup()
    const { onAddUser } = renderHeader('ADMIN')
    await user.click(screen.getByRole('button', { name: '+ Add user' }))
    expect(onAddUser).toHaveBeenCalledOnce()
  })

  it('Sign out opens confirm dialog (does not log out immediately)', async () => {
    const user = userEvent.setup()
    renderHeader('USER')
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(logoutFn).not.toHaveBeenCalled()
  })

  it('confirming sign out invokes logoutFn + navigate', async () => {
    const user = userEvent.setup()
    renderHeader('USER')
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    const dialog = screen.getByRole('dialog')
    const confirmBtn = within(dialog).getByRole('button', { name: 'Sign out' })
    await user.click(confirmBtn)
    expect(logoutFn).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith({ to: '/login' })
  })

  it('cancel in dialog does not sign out', async () => {
    const user = userEvent.setup()
    renderHeader('USER')
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(logoutFn).not.toHaveBeenCalled()
  })
})

