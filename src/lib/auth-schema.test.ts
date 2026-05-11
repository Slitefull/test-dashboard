import { describe, it, expect } from 'vitest'
import { loginSchema } from './auth-schema'

describe('loginSchema', () => {
  it('accepts valid email + password', () => {
    expect(loginSchema.parse({ email: 'a@b.co', password: 'x' })).toEqual({
      email: 'a@b.co',
      password: 'x',
    })
  })

  it('rejects bad email', () => {
    expect(() =>
      loginSchema.parse({ email: 'not-an-email', password: 'x' }),
    ).toThrow()
  })

  it('rejects empty password', () => {
    expect(() => loginSchema.parse({ email: 'a@b.co', password: '' })).toThrow()
  })

  it('rejects missing fields', () => {
    expect(() => loginSchema.parse({ email: 'a@b.co' })).toThrow()
    expect(() => loginSchema.parse({ password: 'x' })).toThrow()
  })
})
