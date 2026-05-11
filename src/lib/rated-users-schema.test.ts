import { describe, it, expect } from 'vitest'
import {
  addSchema,
  buildOrderBy,
  buildWhere,
  DEFAULT_LIST_PARAMS,
  deleteSchema,
  listSchema,
  updateSchema,
} from './rated-users-schema'

describe('listSchema', () => {
  it('applies defaults for empty input', () => {
    const parsed = listSchema.parse({})
    expect(parsed).toEqual(DEFAULT_LIST_PARAMS)
  })

  it('coerces numeric strings', () => {
    const parsed = listSchema.parse({ page: '3', pageSize: '25' })
    expect(parsed.page).toBe(3)
    expect(parsed.pageSize).toBe(25)
  })

  it('rejects negative page', () => {
    expect(() => listSchema.parse({ page: -1 })).toThrow()
  })

  it('rejects pageSize over 100', () => {
    expect(() => listSchema.parse({ pageSize: 101 })).toThrow()
  })

  it('rejects unknown sortBy', () => {
    expect(() => listSchema.parse({ sortBy: 'email' })).toThrow()
  })

  it('rejects sortDir other than asc/desc', () => {
    expect(() => listSchema.parse({ sortDir: 'sideways' })).toThrow()
  })

  it('caps search length at 120', () => {
    expect(() => listSchema.parse({ search: 'a'.repeat(121) })).toThrow()
  })
})

describe('addSchema', () => {
  it('trims name', () => {
    const parsed = addSchema.parse({ name: '  Alice  ', rating: 50 })
    expect(parsed.name).toBe('Alice')
  })

  it('rejects empty name', () => {
    expect(() => addSchema.parse({ name: '   ', rating: 50 })).toThrow()
  })

  it('rejects rating below 0', () => {
    expect(() => addSchema.parse({ name: 'A', rating: -1 })).toThrow()
  })

  it('rejects rating above 100', () => {
    expect(() => addSchema.parse({ name: 'A', rating: 101 })).toThrow()
  })

  it('coerces numeric string rating', () => {
    const parsed = addSchema.parse({ name: 'A', rating: '42' })
    expect(parsed.rating).toBe(42)
  })

  it('rejects fractional rating', () => {
    expect(() => addSchema.parse({ name: 'A', rating: 42.5 })).toThrow()
  })

  it('rejects names over 120 chars', () => {
    expect(() => addSchema.parse({ name: 'a'.repeat(121), rating: 0 })).toThrow()
  })
})

describe('updateSchema', () => {
  it('accepts valid id + name + rating', () => {
    expect(
      updateSchema.parse({ id: 'x', name: 'Alice', rating: 50 }),
    ).toEqual({ id: 'x', name: 'Alice', rating: 50 })
  })
  it('rejects empty id', () => {
    expect(() => updateSchema.parse({ id: '', name: 'A', rating: 0 })).toThrow()
  })
  it('rejects bad rating', () => {
    expect(() => updateSchema.parse({ id: 'x', name: 'A', rating: 200 })).toThrow()
  })
  it('trims name', () => {
    expect(
      updateSchema.parse({ id: 'x', name: '  Bob  ', rating: 1 }).name,
    ).toBe('Bob')
  })
})

describe('deleteSchema', () => {
  it('accepts non-empty id', () => {
    expect(deleteSchema.parse({ id: 'x' })).toEqual({ id: 'x' })
  })
  it('rejects empty id', () => {
    expect(() => deleteSchema.parse({ id: '' })).toThrow()
  })
  it('rejects missing id', () => {
    expect(() => deleteSchema.parse({})).toThrow()
  })
})

describe('buildWhere', () => {
  it('returns undefined for empty search', () => {
    expect(buildWhere('')).toBeUndefined()
    expect(buildWhere('   ')).toBeUndefined()
  })

  it('builds case-insensitive name contains for text', () => {
    const where = buildWhere('alice')
    expect(where).toEqual({
      OR: [{ name: { contains: 'alice', mode: 'insensitive' } }],
    })
  })

  it('adds rating equals branch when numeric', () => {
    const where = buildWhere('42')
    expect(where).toEqual({
      OR: [
        { name: { contains: '42', mode: 'insensitive' } },
        { rating: { equals: 42 } },
      ],
    })
  })

  it('truncates fractional numeric search to integer rating', () => {
    const where = buildWhere('42.9')
    expect(where).toEqual({
      OR: [
        { name: { contains: '42.9', mode: 'insensitive' } },
        { rating: { equals: 42 } },
      ],
    })
  })

  it('trims whitespace before matching', () => {
    const where = buildWhere('   alice   ')
    expect(where).toEqual({
      OR: [{ name: { contains: 'alice', mode: 'insensitive' } }],
    })
  })
})

describe('buildOrderBy', () => {
  it('orders by name asc/desc', () => {
    expect(buildOrderBy('name', 'asc')).toEqual({ name: 'asc' })
    expect(buildOrderBy('name', 'desc')).toEqual({ name: 'desc' })
  })
  it('orders by rating', () => {
    expect(buildOrderBy('rating', 'desc')).toEqual({ rating: 'desc' })
  })
  it('orders by createdAt as fallback', () => {
    expect(buildOrderBy('createdAt', 'asc')).toEqual({ createdAt: 'asc' })
  })
})
