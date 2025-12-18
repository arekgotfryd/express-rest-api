import { describe, it, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcrypt'
import { register, login } from '../../src/controllers/authController.ts'
import { User, Organization } from '../../src/models/index.ts'
import { generateToken } from '../../src/utils/jwt.ts'

vi.mock('../../src/models/index.ts', () => ({
  User: {
    create: vi.fn(),
    findOne: vi.fn(),
  },
  Organization: {
    findOne: vi.fn(),
  },
}))

vi.mock('../../src/utils/jwt.ts', () => ({
  generateToken: vi.fn(),
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('../../src/utils/logger.ts', () => ({
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

      vi.mocked(Organization.findOne).mockResolvedValue(mockOrg as any)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedpassword' as any)
      vi.mocked(User.create).mockResolvedValue(mockUser as any)
      vi.mocked(generateToken).mockResolvedValue('token123')

      await register(mockRequest, mockResponse)

      expect(Organization.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Corp' },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
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
        new Error('Database error')
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
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
      vi.mocked(generateToken).mockResolvedValue('token123')

      await login(mockRequest, mockResponse)

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: credentials.email },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: expect.objectContaining({
          id: 'user-123',
          email: credentials.email,
        }),
        token: 'token123',
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
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any)

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
})
