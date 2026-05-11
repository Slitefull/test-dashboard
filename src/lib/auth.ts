import { createServerFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import { prisma } from './db.server'
import { getAppSession } from './session.server'
import { getSessionUser } from './auth.server'
import { loginSchema, type LoginResult } from './auth-schema'
import type { CurrentUser } from './auth-types'

export type { CurrentUser }
export type { LoginResult }
export { loginSchema } from './auth-schema'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }): Promise<LoginResult> => {
    const user = await prisma.authUser.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (!user) return { ok: false, error: 'Invalid email or password.' }

    const ok = await bcrypt.compare(data.password, user.passwordHash)
    if (!ok) return { ok: false, error: 'Invalid email or password.' }

    const session = await getAppSession()
    await session.update({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { ok: true }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ ok: true }> => {
    const session = await getAppSession()
    await session.clear()
    return { ok: true }
  },
)

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentUser | null> => {
    return await getSessionUser()
  },
)
