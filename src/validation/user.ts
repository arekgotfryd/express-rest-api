import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8),
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  organizationName: z.string().max(100),
})

export const updateUserSchema = createUserSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })
