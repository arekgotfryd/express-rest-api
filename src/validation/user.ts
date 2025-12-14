import { z } from 'zod'

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  organizationName: z.string().max(100).optional()
})

export const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8),
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  organizationName: z.string().max(100)
})
