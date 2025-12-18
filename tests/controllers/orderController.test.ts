import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../src/middleware/auth.ts'
import { container } from '../../src/container.ts'

// const mockOrderService =

vi.mock('../../src/container.ts', () => ({
  container: {
    orderService: {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      getTotalAmountByUser: vi.fn(),
    },
  },
}))
vi.mock('../../src/utils/logger.ts', () => {
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
const { createOrder, deleteOrder, getOrder, updateOrder } = await import(
  '../../src/controllers/orderController.ts'
)

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

  describe('createOrder', () => {
    it('should create an order', async () => {
      const orderData = {
        userId: 'user-123',
        organizationId: 'org-123',
        totalAmount: 100.5,
      }

      const createdOrder = {
        id: 'order-123',
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.body = orderData
      vi.mocked(container.orderService.create).mockResolvedValue(createdOrder as any)

      await createOrder(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.orderService.create).toHaveBeenCalledWith(orderData)
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Order has been created',
      })
    })

    it('should handle creation errors', async () => {
      mockRequest.body = { userId: 'user-123' }

      vi.mocked(container.orderService.create).mockRejectedValue(new Error('Creation failed'))

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

      expect(container.orderService.findById).toHaveBeenCalledWith(
        'order-123',
        expect.anything()
      )
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

      vi.mocked(container.orderService.update).mockResolvedValue([1])

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

      vi.mocked(container.orderService.findById).mockResolvedValue(null)
      vi.mocked(container.orderService.update).mockResolvedValue([0])

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
  })
})
