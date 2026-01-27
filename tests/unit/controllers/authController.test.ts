import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  register,
  login,
  refreshToken,
  logout,
} from '../../../src/controllers/authController.ts'
import { User, Organization } from '../../../src/models/index.ts'
import {
  generateToken,
  generateRefreshToken,
  generateTokenFamily,
  verifyRefreshToken,
} from '../../../src/utils/jwt.ts'
import { hashPassword, comparePassword } from '../../../src/utils/password.ts'
import { RefreshToken } from '../../../src/models/refreshToken.ts'

vi.mock('../../../src/models/index.ts', () => ({
  User: {
    create: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
  },
  Organization: {
    findOne: vi.fn(),
  },
}))
vi.mock('../../../src/models/refreshToken.ts', () => ({
  RefreshToken: {
    create: vi.fn(),
    findByPk: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../../../src/utils/jwt.ts', () => ({
  generateToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  generateTokenFamily: vi.fn(),
}))

vi.mock('../../../src/utils/password.ts', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}))

vi.mock('../../../src/utils/logger.ts', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('AuthController', () => {
  let mockRequest: any
  let mockResponse: any

  beforeEach(() => {
    mockRequest = {
      body: {},
    }

    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    }

    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        organizationName: 'Test Corp',
      }

      mockRequest.body = userData

      const mockOrg = { id: 'org-123', name: 'Test Corp' }
      const mockUser = {
        id: 'user-123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }
      vi.mocked(RefreshToken.create).mockResolvedValue({} as any)
      vi.mocked(Organization.findOne).mockResolvedValue(mockOrg as any)
      vi.mocked(hashPassword).mockResolvedValue('hashedpassword')
      vi.mocked(User.create).mockResolvedValue(mockUser as any)
      vi.mocked(generateToken).mockResolvedValue('token123')
      vi.mocked(generateRefreshToken).mockResolvedValue({ token: 'refreshtoken123', tokenId: 'token-id-123' })
      vi.mocked(generateTokenFamily).mockReturnValue('tokenfamily123')
      await register(mockRequest, mockResponse)

      expect(Organization.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Corp' },
      })
      expect(hashPassword).toHaveBeenCalledWith('password123')
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        password: 'hashedpassword',
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId: mockOrg.id,
      })
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: expect.objectContaining({
          id: 'user-123',
          email: userData.email,
        }),
        token: 'token123',
        refreshToken: 'refreshtoken123',
      })
    })

    it('should return 400 when organization does not exist', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        organizationName: 'Nonexistent Corp',
      }

      vi.mocked(Organization.findOne).mockResolvedValue(null)

      await register(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Organization does not exist',
      })
    })

    it('should handle errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        organizationName: 'Test Corp',
      }

      vi.mocked(Organization.findOne).mockRejectedValue(
        new Error('Database error'),
      )

      await register(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create user',
      })
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      mockRequest.body = credentials

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
      }

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any)
      vi.mocked(comparePassword).mockResolvedValue(true)
      vi.mocked(generateToken).mockResolvedValue('token123')
      vi.mocked(generateRefreshToken).mockResolvedValue({ token: 'refreshtoken123', tokenId: 'token-id-123' })
      vi.mocked(generateTokenFamily).mockReturnValue('tokenfamily123')

      await login(mockRequest, mockResponse)

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: credentials.email },
      })
      expect(comparePassword).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password,
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: expect.objectContaining({
          id: 'user-123',
          email: credentials.email,
        }),
        token: 'token123',
        refreshToken: 'refreshtoken123',
      })
    })

    it('should return 401 when user not found', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      vi.mocked(User.findOne).mockResolvedValue(null)

      await login(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      })
    })

    it('should return 401 when password is invalid', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedpassword',
      }

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any)
      vi.mocked(comparePassword).mockResolvedValue(false)

      await login(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      })
    })

    it('should handle errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      }

      vi.mocked(User.findOne).mockRejectedValue(new Error('Database error'))

      await login(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to login',
      })
    })
  })

  describe('refreshToken', () => {
    it('should return 400 when refresh token is missing', async () => {
      mockRequest.body = {}

      await refreshToken(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Refresh token is required',
      })
    })

    it('should return 401 when refresh token is invalid', async () => {
      mockRequest.body = { refreshToken: 'invalid-token' }

      vi.mocked(verifyRefreshToken).mockRejectedValue(
        new Error('Invalid token'),
      )

      await refreshToken(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired refresh token',
      })
    })

    it('should return 401 when user not found', async () => {
      mockRequest.body = { refreshToken: 'valid-token' }

      vi.mocked(verifyRefreshToken).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        tokenId: 'token-id-123',
        tokenFamily: 'token-family-123',
      })
      vi.mocked(User.findByPk).mockResolvedValue(null)

      await refreshToken(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      })
    })

    it('should return new tokens when refresh is successful', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' }

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      }

      vi.mocked(verifyRefreshToken).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        tokenId: 'token-id-123',
        tokenFamily: 'token-family-123',
      })
      vi.mocked(User.findByPk).mockResolvedValue(mockUser as any)
      vi.mocked(generateToken).mockResolvedValue('new-access-token')
      vi.mocked(generateRefreshToken).mockResolvedValue({ token: 'new-refresh-token', tokenId: 'new-token-id-456' })
      vi.mocked(hashPassword).mockResolvedValue('hashed-new-refresh-token')
      vi.mocked(comparePassword).mockResolvedValue(true)
      vi.mocked(RefreshToken.create).mockResolvedValue({} as any)
      vi.mocked(RefreshToken.update).mockResolvedValue({} as any)
      vi.mocked(RefreshToken.findByPk).mockResolvedValue({
        id: 'token-id-123',
        token: 'hashed-token',
        tokenFamily: 'token-family-123',
        revoked: false,
      } as any)

      await refreshToken(mockRequest, mockResponse)

      expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token')
      expect(User.findByPk).toHaveBeenCalledWith('user-123')
      expect(RefreshToken.findByPk).toHaveBeenCalledWith('token-id-123')
      expect(generateToken).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      })
      expect(generateRefreshToken).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        tokenFamily: 'token-family-123',
      })
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })
    })
  })

  describe('logout', () => {
    it('should return 400 when refresh token is missing', async () => {
      mockRequest.body = {}

      await logout(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Refresh token is required',
      })
    })

    it('should logout successfully and revoke token family', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' }

      vi.mocked(verifyRefreshToken).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        tokenId: 'token-id-123',
        tokenFamily: 'token-family-123',
      })
      vi.mocked(RefreshToken.findByPk).mockResolvedValue({
        id: 'token-id-123',
        token: 'hashed-token',
        tokenFamily: 'token-family-123',
        revoked: false,
      } as any)
      vi.mocked(RefreshToken.update).mockResolvedValue({} as any)

      await logout(mockRequest, mockResponse)

      expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token')
      expect(RefreshToken.findByPk).toHaveBeenCalledWith('token-id-123')
      expect(RefreshToken.update).toHaveBeenCalledWith(
        { revoked: true },
        { where: { tokenFamily: 'token-family-123' } },
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      })
    })

    it('should return success even if token not found in DB', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' }

      vi.mocked(verifyRefreshToken).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        tokenId: 'token-id-123',
        tokenFamily: 'token-family-123',
      })
      vi.mocked(RefreshToken.findByPk).mockResolvedValue(null)

      await logout(mockRequest, mockResponse)

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      })
    })

    it('should return success even if token is invalid', async () => {
      mockRequest.body = { refreshToken: 'invalid-token' }

      vi.mocked(verifyRefreshToken).mockRejectedValue(new Error('Invalid token'))

      await logout(mockRequest, mockResponse)

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      })
    })
  })
})
