import { describe, it, expect } from 'vitest'
import { updateUserSchema } from '../../../src/validation/user.ts'

describe('User Validation Schema', () => {
  describe('updateUserSchema', () => {
    it('should validate correct user data', () => {
      const validData = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = updateUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty firstName', () => {
      const invalidData = {
        email: 'john@example.com',
        firstName: '',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject firstName longer than 50 characters', () => {
      const invalidData = {
        email: 'john@example.com',
        firstName: 'J'.repeat(51),
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty lastName', () => {
      const invalidData = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: '',
        organizationName: 'Acme Corp',
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject lastName longer than 50 characters', () => {
      const invalidData = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'D'.repeat(51),
        organizationName: 'Acme Corp',
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty organizationName', () => {
      const invalidData = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: '',
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject organizationName longer than 100 characters', () => {
      const invalidData = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'O'.repeat(101),
      }
      const result = updateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      const result = updateUserSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
