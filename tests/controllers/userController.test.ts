import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../src/middleware/auth.ts'

const mockUserService = {
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}

vi.mock('../../src/container.ts', () => ({
  container: {
    userService: mockUserService,
  },
}))

vi.mock('../../src/utils/logger.ts', () => {
  const mockLogger = {
    error: vi.fn(),
    info: vi.fn(),
  }
  return {
    logger: mockLogger,
    default: mockLogger,
  }
})

// Import after mocking
const { getUsers, getUser, updateUser, deleteUser } = await import(
  '../../src/controllers/userController.ts'
)

describe('UserController', () => {
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
      user: {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      },
    }

    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    }

    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ]

      mockUserService.count.mockResolvedValue(20)
      mockUserService.findAll.mockResolvedValue(mockUsers)

      mockRequest.query = { page: '1', limit: '10' }

      await getUsers(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockUserService.count).toHaveBeenCalled()
      expect(mockUserService.findAll).toHaveBeenCalledWith(undefined, {
        attributes: ['id', 'email', 'firstName', 'lastName'],
        limit: 10,
        offset: 0,
      })

      expect(mockResponse.json).toHaveBeenCalledWith({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 20,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      })
    })

    it('should use default pagination values', async () => {
      mockUserService.count.mockResolvedValue(5)
      mockUserService.count.mockResolvedValue(0)

      await getUsers(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockUserService.findAll).toHaveBeenCalledWith(undefined, {
        attributes: ['id', 'email', 'firstName', 'lastName'],
        limit: 10,
        offset: 0,
      })
    })

    it('should handle errors', async () => {
      mockUserService.findAll.mockRejectedValue(new Error('Database error'))

      await getUsers(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch users',
      })
    })
  })

  describe('getUser', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
      }

      mockUserService.findById.mockResolvedValue(mockUser)

      await getUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockUserService.findById).toHaveBeenCalledWith('user-123', {
        attributes: ['id', 'email', 'username', 'firstName', 'lastName'],
      })
      expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUser })
    })

    it('should return 404 when user not found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
      }
      mockRequest.user = mockUser as any
      mockUserService.findById.mockResolvedValue(null)

      await getUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      })
    })

    it('should handle errors', async () => {
      mockUserService.findById.mockRejectedValue(new Error('Database error'))

      await getUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch profile',
      })
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      mockUserService.findById.mockResolvedValue({ id: 'user-123' })
      mockUserService.update.mockResolvedValue([1])

      mockRequest.body = {
        firstName: 'Updated',
        lastName: 'Name',
      }

      await updateUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockUserService.findById).toHaveBeenCalledWith('user-123')
      expect(mockUserService.update).toHaveBeenCalledWith('user-123', {
        firstName: 'Updated',
        lastName: 'Name',
      })
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
      })
    })

    it('should return 404 when user not found', async () => {
      mockUserService.findById.mockResolvedValue(null)

      await updateUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      })
    })

    it('should handle errors', async () => {
      mockUserService.findById.mockRejectedValue(new Error('Database error'))

      await updateUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to update user',
      })
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: 'user-123' }
      mockUserService.delete.mockResolvedValue(1)

      await deleteUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockUserService.delete).toHaveBeenCalledWith('user-123')
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      })
    })

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      mockUserService.delete.mockResolvedValue(0)

      await deleteUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      })
    })

    it('should handle errors', async () => {
      mockRequest.params = { id: 'user-123' }
      mockUserService.delete.mockRejectedValue(new Error('Database error'))

      await deleteUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to delete an user',
      })
    })
  })
})
