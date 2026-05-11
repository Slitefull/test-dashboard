import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const hoisted = vi.hoisted(() => ({
  loginFn: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  navigate: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (cfg: unknown) => ({ options: cfg }),
  redirect: (opts: unknown) => opts,
  useRouter: () => ({
    invalidate: hoisted.invalidate,
    navigate: hoisted.navigate,
  }),
}))

vi.mock('~/lib/auth', () => ({
  getCurrentUserFn: vi.fn(),
  loginFn: hoisted.loginFn,
}))

import { Route } from './login'
import { ThemeProvider } from '~/lib/theme'

function renderLogin() {
  const Cmp = Route.options.component
  if (!Cmp) throw new Error('Login route has no component')
  return render(
    <ThemeProvider>
      <Cmp />
    </ThemeProvider>,
  )
}

describe('Login page', () => {
  beforeEach(() => {
    hoisted.loginFn.mockReset()
    hoisted.invalidate.mockReset().mockResolvedValue(undefined)
    hoisted.navigate.mockReset().mockResolvedValue(undefined)
  })

  it('renders email + password fields', () => {
    renderLogin()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('submits credentials and navigates on ok', async () => {
    hoisted.loginFn.mockResolvedValueOnce({ ok: true })
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() =>
      expect(hoisted.loginFn).toHaveBeenCalledWith({
        data: { email: 'admin@example.com', password: 'admin123' },
      }),
    )
    await waitFor(() =>
      expect(hoisted.navigate).toHaveBeenCalledWith({ to: '/dashboard' }),
    )
  })

  it('shows error message when server returns ok:false', async () => {
    hoisted.loginFn.mockResolvedValueOnce({
      ok: false,
      error: 'Invalid email or password.',
    })
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument()
    expect(hoisted.navigate).not.toHaveBeenCalled()
  })

  it('shows fallback error when fn throws', async () => {
    hoisted.loginFn.mockRejectedValueOnce(new Error('Network down'))
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Network down')).toBeInTheDocument()
  })
})
