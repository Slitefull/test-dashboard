import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { prisma } from './db.server'
import { requireUser, requireAdmin } from './auth.server'
import {
  addSchema,
  buildOrderBy,
  buildWhere,
  deleteSchema,
  listSchema,
  updateSchema,
  type ListParams,
} from './rated-users-schema'

export {
  DEFAULT_LIST_PARAMS,
  addSchema,
  buildOrderBy,
  buildWhere,
  deleteSchema,
  listSchema,
  updateSchema,
} from './rated-users-schema'
export type {
  AddRatedUserInput,
  DeleteRatedUserInput,
  ListParams,
  SortDir,
  SortField,
  UpdateRatedUserInput,
} from './rated-users-schema'

export interface RatedUserDTO {
  id: string
  name: string
  rating: number
  createdAt: string
}

export interface ListResult {
  rows: RatedUserDTO[]
  total: number
  page: number
  pageSize: number
}

export const listRatedUsersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => listSchema.parse(data))
  .handler(async ({ data }): Promise<ListResult> => {
    await requireUser()
    const where = buildWhere(data.search)
    const orderBy = buildOrderBy(data.sortBy, data.sortDir)
    const [rows, total] = await prisma.$transaction([
      prisma.ratedUser.findMany({
        where,
        orderBy,
        skip: data.page * data.pageSize,
        take: data.pageSize,
        select: { id: true, name: true, rating: true, createdAt: true },
      }),
      prisma.ratedUser.count({ where }),
    ])
    return {
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const addRatedUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => addSchema.parse(data))
  .handler(async ({ data }): Promise<RatedUserDTO> => {
    const admin = await requireAdmin()
    const created = await prisma.ratedUser.create({
      data: {
        name: data.name,
        rating: data.rating,
        createdById: admin.id,
      },
      select: { id: true, name: true, rating: true, createdAt: true },
    })
    return {
      id: created.id,
      name: created.name,
      rating: created.rating,
      createdAt: created.createdAt.toISOString(),
    }
  })

export const updateRatedUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }): Promise<RatedUserDTO> => {
    await requireAdmin()
    const updated = await prisma.ratedUser.update({
      where: { id: data.id },
      data: { name: data.name, rating: data.rating },
      select: { id: true, name: true, rating: true, createdAt: true },
    })
    return {
      id: updated.id,
      name: updated.name,
      rating: updated.rating,
      createdAt: updated.createdAt.toISOString(),
    }
  })

export const deleteRatedUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deleteSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    await requireAdmin()
    await prisma.ratedUser.delete({ where: { id: data.id } })
    return { id: data.id }
  })

export const ratedUsersQueryOptions = (params: ListParams) =>
  queryOptions<ListResult>({
    queryKey: [
      'rated-users',
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortDir,
      params.search,
    ],
    queryFn: () => listRatedUsersFn({ data: params }),
  })
