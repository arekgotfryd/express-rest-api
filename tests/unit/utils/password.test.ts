import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcrypt'
import { hashPassword, comparePassword, validatePasswordStrength } from '../../../src/utils/password.ts'

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'mypassword123'
      const hashedPassword = 'hashed_password'

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as any)

      const result = await hashPassword(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number))
      expect(result).toBe(hashedPassword)
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'mypassword123'
      const hash = 'hashed_password'

      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)

      const result = await comparePassword(password, hash)

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(true)
    })

    it('should return false for non-matching passwords', async () => {
      const password = 'wrongpassword'
      const hash = 'hashed_password'

      vi.mocked(bcrypt.compare).mockResolvedValue(false as any)

      const result = await comparePassword(password, hash)

      expect(result).toBe(false)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should return valid for a strong password', () => {
      const result = validatePasswordStrength('Password1!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Pa1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('password1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without number', () => {
      const result = validatePasswordStrength('Password!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=']
      for (const char of specialChars) {
        const result = validatePasswordStrength(`Password1${char}`)
        expect(result.isValid).toBe(true)
      }
    })
  })
})
