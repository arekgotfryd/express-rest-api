import { z } from 'zod'

export const orderSchema = z.object({
  totalAmount: z.number().positive(),
  userId: z.uuid({ version: 'v4' }).optional(),
  organizationId: z.uuid({ version: 'v4' }).optional(),
})

export const orderUpdateSchema = z.strictObject({
  totalAmount: z.number().positive(),
})


