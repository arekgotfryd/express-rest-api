import { z } from 'zod'

export const orderSchema = z.object({
  totalAmount: z.number().positive(),
  userId: z.uuid({ version: 'v4' }),
  organizationId: z.uuid({ version: 'v4' }),
})
