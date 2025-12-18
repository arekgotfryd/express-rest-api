import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../src/middleware/auth.ts'
import { authenticateToken } from '../../src/middleware/auth.ts'
import { verifyToken } from '../../src/utils/jwt.ts'

vi.mock('../../src/utils/jwt.ts', () => ({
  verifyToken: vi.fn(),
}))

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      headers: {},
    }

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    mockNext = vi.fn()

    vi.clearAllMocks()
  })

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const token = 'valid.jwt.token'
      const decoded = {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      }

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      }

      vi.mocked(verifyToken).mockResolvedValue(decoded)

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(verifyToken).toHaveBeenCalledWith(token)
      expect(mockRequest.user).toEqual(decoded)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should reject request without authorization header', async () => {
      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with expired token', async () => {
      const token = 'expired.jwt.token'

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      }

      vi.mocked(verifyToken).mockRejectedValue(new Error('Token expired'))

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      })
    })

    it('should handle lowercase bearer token', async () => {
      const token = 'valid.jwt.token'
      const decoded = { id: 'user-123', email: 'test@example.com' }

      mockRequest.headers = {
        authorization: `bearer ${token}`,
      }

      vi.mocked(verifyToken).mockResolvedValue(decoded)

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(verifyToken).toHaveBeenCalledWith(token)
      expect(mockNext).toHaveBeenCalled()
    })
  })
})
