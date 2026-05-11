import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './use-debounced-value'

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebouncedValue', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 200))
    expect(result.current).toBe('a')
  })

  it('updates only after delay elapses', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 200),
      { initialProps: { v: 'a' } },
    )
    rerender({ v: 'b' })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')
  })

  it('resets timer on rapid updates', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 200),
      { initialProps: { v: 'a' } },
    )
    rerender({ v: 'b' })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    rerender({ v: 'c' })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current).toBe('c')
  })

  it('cleans up timer on unmount', () => {
    vi.useFakeTimers()
    const spy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 200),
      { initialProps: { v: 'a' } },
    )
    rerender({ v: 'b' })
    unmount()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
