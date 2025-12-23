import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../../src/middleware/auth.ts'
import { container } from '../../../src/container.ts'
import type { User } from '../../../src/models/user.ts'

vi.mock('../../../src/container.ts', () => ({
  container: {
    userService: {
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('../../../src/utils/logger.ts', () => {
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
  '../../../src/controllers/userController.ts'
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
        {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          organizationId: 'org-123',
        },
        {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          organizationId: 'org-123',
        },
      ]

      vi.mocked(container.userService.count).mockResolvedValue(20)
      vi.mocked(container.userService.findAll).mockResolvedValue(
        mockUsers as User[]
      )

      mockRequest.query = { page: '1', limit: '10' }

      await getUsers(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.userService.count).toHaveBeenCalled()
      expect(container.userService.findAll).toHaveBeenCalledWith(undefined, {
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
      vi.mocked(container.userService.count).mockResolvedValue(5)
      vi.mocked(container.userService.findAll).mockResolvedValue([])

      await getUsers(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.userService.findAll).toHaveBeenCalledWith(undefined, {
        attributes: ['id', 'email', 'firstName', 'lastName'],
        limit: 10,
        offset: 0,
      })
    })

    it('should handle errors', async () => {
      vi.mocked(container.userService.findAll).mockRejectedValue(
        new Error('Database error')
      )

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
        lastName: 'User',
        organizationId: 'org-123',
      }

      vi.mocked(container.userService.findById).mockResolvedValue(
        mockUser as User
      )

      await getUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.userService.findById).toHaveBeenCalledWith('user-123', {
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
      vi.mocked(container.userService.findById).mockResolvedValue(null)

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
      vi.mocked(container.userService.findById).mockRejectedValue(
        new Error('Database error')
      )

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
      vi.mocked(container.userService.findById).mockResolvedValue({
        id: 'user-123',
      } as any)
      vi.mocked(container.userService.update).mockResolvedValue([1])

      mockRequest.body = {
        firstName: 'Updated',
        lastName: 'Name',
      }

      await updateUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.userService.findById).toHaveBeenCalledWith('user-123')
      expect(container.userService.update).toHaveBeenCalledWith('user-123', {
        firstName: 'Updated',
        lastName: 'Name',
      })
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
      })
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(container.userService.findById).mockResolvedValue(null)

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
      vi.mocked(container.userService.findById).mockRejectedValue(
        new Error('Database error')
      )

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
      vi.mocked(container.userService.delete).mockResolvedValue(1)

      await deleteUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.userService.delete).toHaveBeenCalledWith('user-123')
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      })
    })

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      vi.mocked(container.userService.delete).mockResolvedValue(0)

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
      vi.mocked(container.userService.delete).mockRejectedValue(
        new Error('Database error')
      )

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
