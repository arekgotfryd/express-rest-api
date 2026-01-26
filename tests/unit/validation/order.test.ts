import { describe, it, expect } from 'vitest'
import { orderSchema, orderUpdateSchema } from '../../../src/validation/order.ts'

describe('Order Validation Schema', () => {
  it('should validate correct order data with all fields', () => {
    const validData = {
      totalAmount: 99.99,
      userId: '550e8400-e29b-41d4-a716-446655440000',
      organizationId: '550e8400-e29b-41d4-a716-446655440001',
    }
    const result = orderSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should validate order with only totalAmount', () => {
    const validData = { totalAmount: 50 }
    const result = orderSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject zero totalAmount', () => {
    const invalidData = { totalAmount: 0 }
    const result = orderSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative totalAmount', () => {
    const invalidData = { totalAmount: -10 }
    const result = orderSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid userId format', () => {
    const invalidData = {
      totalAmount: 50,
      userId: 'not-a-uuid',
    }
    const result = orderSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid organizationId format', () => {
    const invalidData = {
      totalAmount: 50,
      organizationId: 'not-a-uuid',
    }
    const result = orderSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject missing totalAmount', () => {
    const invalidData = {}
    const result = orderSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('Order Update Validation Schema', () => {
  it('should validate correct update data with only totalAmount', () => {
    const validData = { totalAmount: 99.99 }
    const result = orderUpdateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject zero totalAmount', () => {
    const invalidData = { totalAmount: 0 }
    const result = orderUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative totalAmount', () => {
    const invalidData = { totalAmount: -10 }
    const result = orderUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject missing totalAmount', () => {
    const invalidData = {}
    const result = orderUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject unknown fields like userId', () => {
    const invalidData = {
      totalAmount: 50,
      userId: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = orderUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject unknown fields like organizationId', () => {
    const invalidData = {
      totalAmount: 50,
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = orderUpdateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
