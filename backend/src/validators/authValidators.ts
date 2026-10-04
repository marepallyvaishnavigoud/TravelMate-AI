import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.'),
  email: z.email('Enter a valid email address.').transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password must be 128 characters or fewer.'),
})

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.').transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required.').max(128, 'Password must be 128 characters or fewer.'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
