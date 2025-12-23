import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jwtVerify, SignJWT } from 'jose'
import { generateToken, verifyToken } from '../../../src/utils/jwt.ts'
import { env } from '../../../env.ts'

vi.mock('jose', () => ({
  SignJWT: vi.fn(),
  jwtVerify: vi.fn(),
}))

vi.mock('crypto', () => ({
  createSecretKey: vi.fn((secret: string) => secret),
}))

describe('JWT Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateToken', () => {
    it('should generate a token with user payload', async () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockToken = 'generated.jwt.token'
      const mockSignJWTInstance = {
        setProtectedHeader: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue(mockToken),
      }

      vi.mocked(SignJWT).mockReturnValue(mockSignJWTInstance as any)

      const result = await generateToken(payload)

      expect(SignJWT).toHaveBeenCalledWith(payload)
      expect(mockSignJWTInstance.setProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' })
      expect(mockSignJWTInstance.setIssuedAt).toHaveBeenCalled()
      expect(mockSignJWTInstance.setExpirationTime).toHaveBeenCalledWith(expect.any(String))
      expect(mockSignJWTInstance.sign).toHaveBeenCalled()
      expect(result).toBe(mockToken)
    })

    it('should include organizationId if provided', async () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      }

      const mockSignJWTInstance = {
        setProtectedHeader: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue('token'),
      }

      vi.mocked(SignJWT).mockReturnValue(mockSignJWTInstance as any)

      await generateToken(payload)

      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-123',
        })
      )
    })

    it('should throw error if JWT_SECRET is not set', async () => {
      const originalSecret = env.JWT_SECRET
      delete env.JWT_SECRET

      const payload = {
        id: 'user-123',
        email: 'test@example.com',
      }

      await expect(generateToken(payload)).rejects.toThrow(
        'JWT_SECRET environment variable is not set'
      )

      env.JWT_SECRET = originalSecret
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      const token = 'valid.jwt.token'
      const decoded = {
        id: 'user-123',
        email: 'test@example.com',
      }

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: decoded,
        protectedHeader: { alg: 'HS256' },
      } as any)

      const result = await verifyToken(token)

      expect(jwtVerify).toHaveBeenCalledWith(token, expect.any(String))
      expect(result).toEqual(decoded)
    })

    it('should throw error for invalid token', async () => {
      const token = 'invalid.jwt.token'

      vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid token'))

      await expect(verifyToken(token)).rejects.toThrow('Invalid token')
    })
  })
})
