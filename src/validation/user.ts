import { z } from 'zod'

export const updateUserSchema = z.strictObject({
  email: z.email('Invalid email format'),
  firstName: z.string().min(1, 'Please provide first name').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Please provide last name').max(50, 'Last name too long'),
})
