import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginResult = { ok: true } | { ok: false; error: string }
