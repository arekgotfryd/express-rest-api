import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcrypt'
import { hashPassword, comparePassword } from '../../../src/utils/password.ts'

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
})
