import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderService } from '../../../src/services/orderService.ts'
import type { Repository } from '../../../src/db/repository/Repository.ts'
import type { Order } from '../../../src/models/order.ts'

describe('OrderService', () => {
  let orderService: OrderService
  let mockRepository: Repository<Order>

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    }
    orderService = new OrderService(mockRepository)
    vi.clearAllMocks()
  })

  describe('save', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: 'user-123',
        organizationId: 'org-123',
        totalAmount: 100,
      }

      const mockOrder = { id: 'order-123', ...orderData }
      vi.mocked(mockRepository.save).mockResolvedValue(mockOrder as Order)

      const result = await orderService.save(orderData)

      expect(mockRepository.save).toHaveBeenCalledWith(orderData)
      expect(result).toEqual(mockOrder)
    })
  })

  describe('findById', () => {
    it('should find an order by id', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        totalAmount: 100,
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockOrder as Order)

      const result = await orderService.findById('order-123')

      expect(mockRepository.findById).toHaveBeenCalledWith('order-123')
      expect(result).toEqual(mockOrder)
    })

    it('should return null when order not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      const result = await orderService.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should find all orders with pagination', async () => {
      const mockOrders = [
        { id: 'order-1', userId: 'user-1', totalAmount: 100 },
        { id: 'order-2', userId: 'user-2', totalAmount: 200 },
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockOrders as Order[])

      const result = await orderService.findAll(10, 0)

      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 0)
      expect(result).toEqual(mockOrders)
    })
  })

  describe('update', () => {
    it('should update an order', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(1)

      const result = await orderService.update('order-123', {
        totalAmount: 150,
      })

      expect(mockRepository.update).toHaveBeenCalledWith('order-123', {
        totalAmount: 150,
      })
      expect(result).toBe(1)
    })

    it('should return 0 when order not found', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(0)

      const result = await orderService.update('nonexistent', {
        totalAmount: 150,
      })

      expect(result).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete an order', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(1)

      const result = await orderService.delete('order-123')

      expect(mockRepository.delete).toHaveBeenCalledWith('order-123')
      expect(result).toBe(1)
    })

    it('should return 0 when order not found', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(0)

      const result = await orderService.delete('nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('count', () => {
    it('should count all orders', async () => {
      vi.mocked(mockRepository.count).mockResolvedValue(10)

      const result = await orderService.count()

      expect(mockRepository.count).toHaveBeenCalled()
      expect(result).toBe(10)
    })
  })
})
