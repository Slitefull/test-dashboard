import type { Role } from '@prisma/client'

export interface CurrentUser {
  id: string
  email: string
  role: Role
}
