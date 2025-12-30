import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderService } from '../../../src/services/orderService.ts'
import { Order } from '../../../src/models/index.ts'

vi.mock('../../../src/models/index.ts', () => ({
  Order: {
    create: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
  },
  User: {},
  Organization: {},
}))

describe('OrderService', () => {
  let orderService: OrderService

  beforeEach(() => {
    orderService = new OrderService()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: 'user-123',
        organizationId: 'org-123',
        totalAmount: 100,
      }

      const mockOrder = { id: 'order-123', ...orderData }
      vi.mocked(Order.create).mockResolvedValue(mockOrder as any)

      const result = await orderService.create(orderData)

      expect(Order.create).toHaveBeenCalledWith(orderData, undefined)
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

      vi.mocked(Order.findByPk).mockResolvedValue(mockOrder as any)

      const result = await orderService.findById('order-123')

      expect(Order.findByPk).toHaveBeenCalledWith('order-123', undefined)
      expect(result).toEqual(mockOrder)
    })
  })

  describe('update', () => {
    it('should update an order', async () => {
      vi.mocked(Order.update).mockResolvedValue([1] as any)

      const result = await orderService.update('order-123', {
        totalAmount: 150,
      })

      expect(Order.update).toHaveBeenCalledWith(
        { totalAmount: 150 },
        { where: { id: 'order-123' } }
      )
      expect(result).toEqual([1])
    })
  })

  describe('delete', () => {
    it('should delete an order', async () => {
      vi.mocked(Order.destroy).mockResolvedValue(1)

      const result = await orderService.delete('order-123')

      expect(Order.destroy).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      })
      expect(result).toBe(1)
    })
  })

  describe('count', () => {
    it('should count all orders', async () => {
      vi.mocked(Order.count).mockResolvedValue(10)

      const result = await orderService.count()

      expect(result).toBe(10)
    })
  })
})
