import { z } from 'zod'
import { updateUserSchema } from './user.ts'

const message = 'Password is required and must be at least 8 characters long'
export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, message),
})

export const registerUserSchema = updateUserSchema.extend({
  password: z.string().min(8, message),
})
