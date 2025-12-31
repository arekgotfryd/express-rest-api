import { describe, it, expect } from 'vitest'
import { organizationSchema } from '../../../src/validation/organization.ts'

describe('Organization Validation Schema', () => {
  it('should validate correct organization data', () => {
    const validData = {
      name: 'Acme Corporation',
      industry: 'Technology',
      dateFounded: new Date('2020-01-15'),
    }
    const result = organizationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const invalidData = {
      name: '',
      industry: 'Technology',
      dateFounded: new Date('2020-01-15'),
    }
    const result = organizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject name longer than 100 characters', () => {
    const invalidData = {
      name: 'A'.repeat(101),
      industry: 'Technology',
      dateFounded: new Date('2020-01-15'),
    }
    const result = organizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty industry', () => {
    const invalidData = {
      name: 'Acme Corp',
      industry: '',
      dateFounded: new Date('2020-01-15'),
    }
    const result = organizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject industry longer than 100 characters', () => {
    const invalidData = {
      name: 'Acme Corp',
      industry: 'T'.repeat(101),
      dateFounded: new Date('2020-01-15'),
    }
    const result = organizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject future date founded', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    
    const invalidData = {
      name: 'Acme Corp',
      industry: 'Technology',
      dateFounded: futureDate,
    }
    const result = organizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject missing fields', () => {
    const result = organizationSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
