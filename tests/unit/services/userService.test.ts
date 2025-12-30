import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '../../../src/services/userService.ts'
import { User } from '../../../src/models/index.ts'

// Mock the User model
vi.mock('../../../src/models/index.ts', () => ({
  User: {
    create: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
  },
  Organization: {},
  Order: {},
}))

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'org-123',
      }

      const mockUser = { id: 'user-123', ...userData }
      vi.mocked(User.create).mockResolvedValue(mockUser as any)

      const result = await userService.create(userData)

      expect(User.create).toHaveBeenCalledWith(userData, undefined)
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

      vi.mocked(User.findByPk).mockResolvedValue(mockUser as any)

      const result = await userService.findById('user-123')

      expect(User.findByPk).toHaveBeenCalledWith('user-123', undefined)
      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      vi.mocked(User.findByPk).mockResolvedValue(null)

      const result = await userService.findById('nonexistent')

      expect(result).toBeNull()
    })

    it('should accept options parameter', async () => {
      const options = { attributes: ['id', 'email'] }
      vi.mocked(User.findByPk).mockResolvedValue({} as any)

      await userService.findById('user-123', options)

      expect(User.findByPk).toHaveBeenCalledWith('user-123', options)
    })
  })

  describe('findOne', () => {
    it('should find a user by criteria', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any)

      const result = await userService.findOne({ email: 'test@example.com' })

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('findAll', () => {
    it('should find all users', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ]

      vi.mocked(User.findAll).mockResolvedValue(mockUsers as any)

      const result = await userService.findAll()

      expect(User.findAll).toHaveBeenCalled()
      expect(result).toEqual(mockUsers)
    })

    it('should find users with criteria', async () => {
      const mockUsers = [{ id: 'user-1', email: 'user1@example.com' }]

      vi.mocked(User.findAll).mockResolvedValue(mockUsers as any)

      const result = await userService.findAll({ organizationId: 'org-123' })

      expect(User.findAll).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      })
      expect(result).toEqual(mockUsers)
    })

    it('should support pagination options', async () => {
      vi.mocked(User.findAll).mockResolvedValue([] as any)

      await userService.findAll(undefined, { limit: 10, offset: 0 })

      expect(User.findAll).toHaveBeenCalledWith({
        where: undefined,
        limit: 10,
        offset: 0,
      })
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      vi.mocked(User.update).mockResolvedValue([1] as any)

      const result = await userService.update('user-123', {
        firstName: 'Updated',
      })

      expect(User.update).toHaveBeenCalledWith(
        { firstName: 'Updated' },
        { where: { id: 'user-123' } }
      )
      expect(result).toEqual([1])
    })

    it('should return 0 when user not found', async () => {
      vi.mocked(User.update).mockResolvedValue([0] as any)

      const result = await userService.update('nonexistent', {
        firstName: 'Updated',
      })

      expect(result).toEqual([0])
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      vi.mocked(User.destroy).mockResolvedValue(1)

      const result = await userService.delete('user-123')

      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 'user-123' } })
      expect(result).toBe(1)
    })

    it('should return 0 when user not found', async () => {
      vi.mocked(User.destroy).mockResolvedValue(0)

      const result = await userService.delete('nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('count', () => {
    it('should count all users', async () => {
      vi.mocked(User.count).mockResolvedValue(5)

      const result = await userService.count()

      expect(User.count).toHaveBeenCalledWith({ where: undefined })
      expect(result).toBe(5)
    })

    it('should count users with criteria', async () => {
      vi.mocked(User.count).mockResolvedValue(2)

      const result = await userService.count({ organizationId: 'org-123' })

      expect(User.count).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      })
      expect(result).toBe(2)
    })
  })

  describe('exists', () => {
    it('should return true when user exists', async () => {
      vi.mocked(User.count).mockResolvedValue(1)

      const result = await userService.exists('user-123')

      expect(result).toBe(true)
    })

    it('should return false when user does not exist', async () => {
      vi.mocked(User.count).mockResolvedValue(0)

      const result = await userService.exists('nonexistent')

      expect(result).toBe(false)
    })
  })

})
