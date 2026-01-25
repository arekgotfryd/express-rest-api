import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../../src/middleware/auth.ts'
import { container } from '../../../src/container.ts'

vi.mock('../../../src/container.ts', () => ({
  container: {
    orderService: {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))
vi.mock('../../../src/utils/logger.ts', () => {
  const mockLogger = {
    error: vi.fn(),
    info: vi.fn(),
  }
  return {
    logger: mockLogger,
    default: mockLogger,
  }
})

// Import after mocking
const { createOrder, deleteOrder, getOrder, getOrders, updateOrder } =
  await import('../../../src/controllers/orderController.ts')

describe('Order Controller', () => {
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      },
      params: {},
      body: {},
      query: {},
    }

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    vi.clearAllMocks()
  })

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      mockRequest.query = { page: '1', limit: '10' }

      const orders = [
        { id: 'order-1', userId: 'user-1', organizationId: 'org-1', totalAmount: 100 },
        { id: 'order-2', userId: 'user-2', organizationId: 'org-2', totalAmount: 200 },
      ]

      vi.mocked(container.orderService.count).mockResolvedValue(20)
      vi.mocked(container.orderService.findAll).mockResolvedValue(orders as any)

      await getOrders(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.count).toHaveBeenCalled()
      expect(container.orderService.findAll).toHaveBeenCalledWith(10, 0)
      expect(mockResponse.json).toHaveBeenCalledWith({
        orders: orders,
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 20,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      })
    })

    it('should use default pagination when query params are missing', async () => {
      mockRequest.query = {}

      vi.mocked(container.orderService.count).mockResolvedValue(5)
      vi.mocked(container.orderService.findAll).mockResolvedValue([])

      await getOrders(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.findAll).toHaveBeenCalledWith(10, 0)
    })

    it('should handle getOrders errors', async () => {
      mockRequest.query = {}

      vi.mocked(container.orderService.count).mockRejectedValue(
        new Error('Database error')
      )

      await getOrders(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch orders',
      })
    })
  })

  describe('createOrder', () => {
    it('should create an order', async () => {
      const createdOrder = {
        id: 'order-123',
        userId: 'user-123',
        organizationId: 'org-123',
        totalAmount: 100.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Expected DTO format (without timestamps)
      const expectedOrder = {
        id: 'order-123',
        userId: 'user-123',
        organizationId: 'org-123',
        totalAmount: 100.5,
      }

      mockRequest.body = { totalAmount: 100.5 }
      vi.mocked(container.orderService.save).mockResolvedValue(createdOrder as any)

      await createOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.save).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: 'org-123',
        totalAmount: 100.5,
      })
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({ order: expectedOrder })
    })

    it('should handle creation errors', async () => {
      mockRequest.body = { totalAmount: 100 }

      vi.mocked(container.orderService.save).mockRejectedValue(new Error('Creation failed'))

      await createOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create order',
      })
    })
  })

  describe('getOrder', () => {
    it('should return an order by id', async () => {
      const order = {
        id: 'order-123',
        userId: 'user-123',
        totalAmount: 100.5,
      }

      mockRequest.params = { id: 'order-123' }
      vi.mocked(container.orderService.findById).mockResolvedValue(order as any)

      await getOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.findById).toHaveBeenCalledWith('order-123')
      expect(mockResponse.json).toHaveBeenCalledWith({ order })
    })

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      vi.mocked(container.orderService.findById).mockResolvedValue(null)

      await getOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order not found',
      })
    })

    it('should handle getOrder errors', async () => {
      mockRequest.params = { id: 'order-123' }
      vi.mocked(container.orderService.findById).mockRejectedValue(
        new Error('Database error')
      )

      await getOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch order',
      })
    })
  })

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const updateData = {
        userId: 'userId',
        organizationId: 'orgId',
        totalAmount: 150.75,
      }
      mockRequest.params = { id: 'order-123' }
      mockRequest.body = updateData

      vi.mocked(container.orderService.update).mockResolvedValue(1)

      await updateOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.update).toHaveBeenCalledWith(
        'order-123',
        updateData
      )

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order updated successfully',
      })
    })

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      mockRequest.body = { status: 'completed' }

      vi.mocked(container.orderService.update).mockResolvedValue(0)

      await updateOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order not found',
      })
    })
  })

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      mockRequest.params = { id: 'order-123' }
      vi.mocked(container.orderService.delete).mockResolvedValue(1)

      await deleteOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.delete).toHaveBeenCalledWith('order-123')
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order deleted successfully',
      })
    })

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      vi.mocked(container.orderService.delete).mockResolvedValue(0)

      await deleteOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order not found',
      })
    })

    it('should handle delete errors', async () => {
      mockRequest.params = { id: 'order-123' }
      vi.mocked(container.orderService.delete).mockRejectedValue(
        new Error('Delete failed')
      )

      await deleteOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to delete an order',
      })
    })
  })

  describe('updateOrder - error handling', () => {
    it('should handle update errors', async () => {
      mockRequest.params = { id: 'order-123' }
      mockRequest.body = { totalAmount: 100 }
      vi.mocked(container.orderService.update).mockRejectedValue(
        new Error('Update failed')
      )

      await updateOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to update order',
      })
    })
  })
})
