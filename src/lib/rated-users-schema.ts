import { z } from 'zod'
import type { Prisma } from '@prisma/client'

export type SortField = 'name' | 'rating' | 'createdAt'
export type SortDir = 'asc' | 'desc'

export interface ListParams {
  page: number
  pageSize: number
  sortBy: SortField
  sortDir: SortDir
  search: string
}

export const DEFAULT_LIST_PARAMS: ListParams = {
  page: 0,
  pageSize: 10,
  sortBy: 'rating',
  sortDir: 'desc',
  search: '',
}

export const listSchema = z.object({
  page: z.coerce.number().int().min(0).max(10_000).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'rating', 'createdAt']).default('rating'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(120).default(''),
})

export const addSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  rating: z.coerce.number().int().min(0).max(100),
})

export type AddRatedUserInput = z.input<typeof addSchema>

export const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required').max(120),
  rating: z.coerce.number().int().min(0).max(100),
})

export type UpdateRatedUserInput = z.input<typeof updateSchema>

export const deleteSchema = z.object({
  id: z.string().min(1),
})

export type DeleteRatedUserInput = z.input<typeof deleteSchema>

export function buildWhere(
  search: string,
): Prisma.RatedUserWhereInput | undefined {
  const q = search.trim()
  if (!q) return undefined
  const asNumber = Number(q)
  const ratingClause: Prisma.RatedUserWhereInput[] = Number.isFinite(asNumber)
    ? [{ rating: { equals: Math.trunc(asNumber) } }]
    : []
  return {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      ...ratingClause,
    ],
  }
}

export function buildOrderBy(
  sortBy: SortField,
  sortDir: SortDir,
): Prisma.RatedUserOrderByWithRelationInput {
  if (sortBy === 'name') return { name: sortDir }
  if (sortBy === 'rating') return { rating: sortDir }
  return { createdAt: sortDir }
}
