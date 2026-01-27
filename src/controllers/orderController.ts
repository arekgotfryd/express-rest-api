import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { container } from '../container.ts'
import type { Order } from '../models/order.ts'
import { logger } from '../utils/logger.ts'
import { toOrderDTO, toOrderDTOList, toOrderWithRelationsDTO, toPaginationDTO } from '../dtos/mappers.ts'
import type {
  OrdersResponseDTO,
  OrderResponseDTO,
  OrderWithRelationsResponseDTO,
  MessageDTO,
  ErrorDTO,
} from '../dtos/index.ts'

export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response<OrdersResponseDTO | ErrorDTO>
) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await container.orderService.count()

    // Fetch paginated orders
    const orders = await container.orderService.findAll(
      limit,
      offset,
    )

    res.json({
      orders: toOrderDTOList(orders),
      pagination: toPaginationDTO(page, limit, totalCount),
    })
  } catch (error) {
    logger.error('Get all orders error', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

export const getOrder = async (
  req: AuthenticatedRequest,
  res: Response<OrderWithRelationsResponseDTO | ErrorDTO>
) => {
  try {
    const orderId = req.params.id

    const order = await container.orderService.findById(orderId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ order: toOrderWithRelationsDTO(order) })
  } catch (error) {
    logger.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
}

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response<OrderResponseDTO | ErrorDTO>
) => {
  try {
    const { totalAmount } = req.body
    const userId = req.user!.id
    const organizationId = req.user!.organizationId
    const order = await container.orderService.save({
      userId,
      organizationId,
      totalAmount,
    })

    res.status(201).json({ order: toOrderDTO(order) })
  } catch (error) {
    logger.error('Order create error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

export const updateOrder = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>
) => {
  try {
    const orderId = req.params.id
    const { totalAmount } = req.body

    const updatedCount = await container.orderService.update(orderId, {
      totalAmount,
    })

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({
      message: 'Order updated successfully',
    })
  } catch (error) {
    logger.error('Update order error:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
}

export const deleteOrder = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>
) => {
  try {
    const deletedCount = await container.orderService.delete(req.params.id)

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    logger.error('Delete order error', error)
    res.status(500).json({ error: 'Failed to delete an order' })
  }
}

