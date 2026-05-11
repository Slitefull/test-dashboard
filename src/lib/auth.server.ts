import { redirect } from '@tanstack/react-router'
import { Role } from '@prisma/client'
import { prisma } from './db.server'
import { getAppSession } from './session.server'
import type { CurrentUser } from './auth-types'

export async function getSessionUser(): Promise<CurrentUser | null> {
  const session = await getAppSession()
  const userId = session.data.userId
  if (!userId) return null
  const user = await prisma.authUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })
  return user
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getSessionUser()
  if (!user) throw redirect({ to: '/login' })
  return user
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser()
  if (user.role !== Role.ADMIN) {
    throw new Error('Forbidden: admin only.')
  }
  return user
}
