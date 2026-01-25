import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '../../../src/services/userService.ts'
import type { Repository } from '../../../src/db/repository/Repository.ts'
import type { User } from '../../../src/models/user.ts'

describe('UserService', () => {
  let userService: UserService
  let mockRepository: Repository<User>

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    }
    userService = new UserService(mockRepository)
    vi.clearAllMocks()
  })

  describe('save', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'org-123',
      } as Partial<User>

      const mockUser = { id: 'user-123', ...userData }
      vi.mocked(mockRepository.save).mockResolvedValue(mockUser as User)

      const result = await userService.save(userData)

      expect(mockRepository.save).toHaveBeenCalledWith(userData)
      expect(result).toEqual(mockUser)
    })
  })

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser as User)

      const result = await userService.findById('user-123')

      expect(mockRepository.findById).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      const result = await userService.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should find all users with pagination', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockUsers as User[])

      const result = await userService.findAll(10, 0)

      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 0)
      expect(result).toEqual(mockUsers)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(1)

      const result = await userService.update('user-123', {
        firstName: 'Updated',
      })

      expect(mockRepository.update).toHaveBeenCalledWith('user-123', {
        firstName: 'Updated',
      })
      expect(result).toBe(1)
    })

    it('should return 0 when user not found', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(0)

      const result = await userService.update('nonexistent', {
        firstName: 'Updated',
      })

      expect(result).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(1)

      const result = await userService.delete('user-123')

      expect(mockRepository.delete).toHaveBeenCalledWith('user-123')
      expect(result).toBe(1)
    })

    it('should return 0 when user not found', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(0)

      const result = await userService.delete('nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('count', () => {
    it('should count all users', async () => {
      vi.mocked(mockRepository.count).mockResolvedValue(5)

      const result = await userService.count()

      expect(mockRepository.count).toHaveBeenCalled()
      expect(result).toBe(5)
    })
  })
})
