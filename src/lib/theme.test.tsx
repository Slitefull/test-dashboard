import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, themeInitScript, useTheme } from './theme'

function Probe() {
  const { theme, toggle, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggle}>
        toggle
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        set light
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    try {
      window.localStorage.clear()
    } catch {
      // setup hook handles cleanup
    }
  })

  it('defaults to dark when no attribute set', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('reads initial theme from html data-theme attribute', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('toggle flips between dark and light', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    await user.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    await user.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('persists choice to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    await user.click(screen.getByText('set light'))
    expect(localStorage.getItem('app-theme')).toBe('light')
  })

  it('throws useTheme called outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/useTheme/)
    spy.mockRestore()
  })
})

describe('themeInitScript', () => {
  let mq: { matches: boolean }
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    try {
      window.localStorage.clear()
    } catch {
      // setup hook handles cleanup
    }
    mq = { matches: false }
    originalMatchMedia = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (): MediaQueryList => mq as unknown as MediaQueryList,
    })
  })
  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    })
  })

  function run() {
    const fn = new Function(themeInitScript)
    fn()
  }

  it('uses stored theme when valid', () => {
    localStorage.setItem('app-theme', 'light')
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('falls back to system preference when no storage', () => {
    mq.matches = true
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('defaults to dark when no storage and system is dark', () => {
    mq.matches = false
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('survives localStorage throwing', () => {
    const orig = window.localStorage.getItem
    window.localStorage.getItem = () => {
      throw new Error('blocked')
    }
    try {
      run()
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    } finally {
      window.localStorage.getItem = orig
    }
  })
})
