import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppTestProviders } from '~/test/providers'
import { ThemeToggle } from './theme-toggle'

function renderToggle() {
  return render(
    <AppTestProviders>
      <ThemeToggle />
    </AppTestProviders>,
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    try {
      window.localStorage.clear()
    } catch {
      // ignore
    }
  })

  it('renders toggle button with aria-label reflecting target theme', () => {
    renderToggle()
    expect(
      screen.getByRole('button', { name: /switch to light theme/i }),
    ).toBeInTheDocument()
  })

  it('flips data-theme on click', async () => {
    const user = userEvent.setup()
    renderToggle()
    await user.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('app-theme')).toBe('light')
  })

  it('cycles back to dark on second click', async () => {
    const user = userEvent.setup()
    renderToggle()
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
