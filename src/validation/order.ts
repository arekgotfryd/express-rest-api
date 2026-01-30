import { z } from 'zod'
import logger from '../utils/logger.ts'

const MAX_BULK_ORDER_TOTAL = Number(process.env.MAX_BULK_ORDER_TOTAL) || 100000

export const orderSchema = z.object({
  totalAmount: z.number().positive(),
  userId: z.uuid({ version: 'v4' }).optional(),
  organizationId: z.uuid({ version: 'v4' }).optional(),
})

export const orderUpdateSchema = z.strictObject({
  totalAmount: z.number().positive(),
})

export const ordersSchema = z.object({
  orders: z.array(orderSchema),
})

export const bulkOrdersSchema = z
  .object({
    orders: z.array(orderSchema).min(1, 'At least one order is required'),
  })
  .refine(
    (data) => {
      const organizationIds = data.orders
        .map((order) => order.organizationId)
        .filter((id) => id !== undefined)
      logger.debug('Organization IDs in bulk order:', organizationIds)

      if (organizationIds.length === 0) return true

      return organizationIds.every((id) => id === organizationIds[0])
    },
    {
      message: 'All orders must have the same organizationId',
      path: ['orders'],
    },
  )
  .refine(
    (data) => {
      const totalSum = data.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      return totalSum <= MAX_BULK_ORDER_TOTAL
    },
    {
      message: `Total sum of all orders must not exceed ${MAX_BULK_ORDER_TOTAL}`,
      path: ['orders'],
    },
  )

