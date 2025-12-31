import { describe, it, expect } from 'vitest'
import { loginSchema, registerUserSchema, refreshTokenSchema } from '../../../src/validation/auth.ts'

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('registerUserSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password1!',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = registerUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password1!',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = registerUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD1!',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = registerUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password!',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = registerUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password without special character', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = registerUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pa1!',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'Acme Corp',
      }
      const result = registerUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('refreshTokenSchema', () => {
    it('should validate correct refresh token', () => {
      const validData = { refreshToken: 'some-valid-token' }
      const result = refreshTokenSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty refresh token', () => {
      const invalidData = { refreshToken: '' }
      const result = refreshTokenSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing refresh token', () => {
      const result = refreshTokenSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
