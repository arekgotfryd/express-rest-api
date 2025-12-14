import { z } from 'zod'

export const createOrderSchema = z.object({
  totalAmount: z.number().positive(),
})
export const updateOrderSchema = z.object({
  totalAmount: z.number().positive(),
  userId: z.uuid({ version: 'v4' }).optional(),
  organizationId: z.uuid({ version: 'v4' }).optional(),
})
