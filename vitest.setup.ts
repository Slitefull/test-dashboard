import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

interface MemoryStorage extends Storage {
  __store: Map<string, string>
}

function createStorage(): MemoryStorage {
  const store = new Map<string, string>()
  return {
    __store: store,
    getItem(key: string) {
      return store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
    removeItem(key: string) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
    key(i: number) {
      return Array.from(store.keys())[i] ?? null
    },
    get length() {
      return store.size
    },
  }
}

const storage = createStorage()
Object.defineProperty(window, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
})
Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
})

if (typeof window.scrollTo !== 'function' || window.scrollTo.length === 0) {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: () => {},
  })
}

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  storage.__store.clear()
  document.documentElement.removeAttribute('data-theme')
})
