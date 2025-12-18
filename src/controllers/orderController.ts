import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { container } from '../container.ts'
import type { Order } from '../models/order.ts'
import { logger } from '../utils/logger.ts'

const attributes = ['id', 'userId', 'organizationId', 'totalAmount']

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await container.orderService.count()

    // Fetch paginated orders
    const orders = await container.orderService.findAll(undefined, {
      attributes,
      limit,
      offset,
    })

    res.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    logger.error('Get all orders error', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id

    const order: Order = await container.orderService.findById(orderId, {
      attributes,
      include: [
        {
          association: 'user',
          attributes: ['id', 'email'],
        },
        {
          association: 'organization',
          attributes: ['id', 'name'],
        },
      ],
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ order })
  } catch (error) {
    logger.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { totalAmount } = req.body
    const userId = req.user!.id
    const organizationId = req.user!.organizationId
    await container.orderService.create({
      userId,
      organizationId,
      totalAmount,
    })

    res.status(201).json({ message: 'Order has been created' })
  } catch (error) {
    logger.error('Order create error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

export const updateOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id
    const { userId, organizationId, totalAmount } = req.body

    const updatedOrders = await container.orderService.update(orderId, {
      userId,
      organizationId,
      totalAmount,
    })

    if (updatedOrders[0] === 0) {
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

export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
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

