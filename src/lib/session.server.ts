import { useSession } from '@tanstack/react-start/server'
import type { Role } from '@prisma/client'

export interface SessionData {
  userId: string
  email: string
  role: Role
}

export function getAppSession() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET env var must be set and at least 32 characters long.',
    )
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- `useSession` is a server-side helper from @tanstack/react-start/server, not a React hook.
  return useSession<SessionData>({
    name: 'app-session',
    password: secret,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
    },
  })
}
