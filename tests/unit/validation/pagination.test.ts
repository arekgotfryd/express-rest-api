import { describe, it, expect } from 'vitest'
import { paginationSchema } from '../../../src/validation/pagination.ts'

describe('Pagination Validation Schema', () => {
  it('should validate correct pagination params', () => {
    const validData = { page: 1, limit: 10 }
    const result = paginationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ page: 1, limit: 10 })
  })

  it('should apply default values when not provided', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ page: 1, limit: 10 })
  })

  it('should coerce string values to numbers', () => {
    const validData = { page: '5', limit: '20' }
    const result = paginationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ page: 5, limit: 20 })
  })

  it('should reject zero page', () => {
    const invalidData = { page: 0, limit: 10 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative page', () => {
    const invalidData = { page: -1, limit: 10 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject zero limit', () => {
    const invalidData = { page: 1, limit: 0 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative limit', () => {
    const invalidData = { page: 1, limit: -5 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject limit exceeding 100', () => {
    const invalidData = { page: 1, limit: 101 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept limit of exactly 100', () => {
    const validData = { page: 1, limit: 100 }
    const result = paginationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject non-integer page', () => {
    const invalidData = { page: 1.5, limit: 10 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject non-integer limit', () => {
    const invalidData = { page: 1, limit: 10.5 }
    const result = paginationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
