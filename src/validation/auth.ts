import { z } from 'zod'
import { updateUserSchema } from './user.ts'

// Password strength validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /\d/.test(val), {
    message: 'Password must contain at least one number',
  })
  .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: 'Password must contain at least one special character',
  })

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password is required and must be at least 8 characters long'),
})

export const registerUserSchema = updateUserSchema.extend({
  password: passwordSchema,
  organizationName: z.string().min(1, 'Please provide organization name').max(100, 'Organization name too long'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})
