import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrganizationService } from '../../../src/services/organizationService.ts'
import type { Repository } from '../../../src/db/repository/Repository.ts'
import type { Organization } from '../../../src/models/organization.ts'

describe('OrganizationService', () => {
  let organizationService: OrganizationService
  let mockRepository: Repository<Organization>

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    }
    organizationService = new OrganizationService(mockRepository)
    vi.clearAllMocks()
  })

  describe('save', () => {
    it('should create a new organization', async () => {
      const orgData = {
        name: 'Test Corp',
        industry: 'Technology',
        dateFounded: new Date('2020-01-01'),
      }

      const mockOrg = { id: 'org-123', ...orgData }
      vi.mocked(mockRepository.save).mockResolvedValue(mockOrg as Organization)

      const result = await organizationService.save(orgData)

      expect(mockRepository.save).toHaveBeenCalledWith(orgData)
      expect(result).toEqual(mockOrg)
    })
  })

  describe('findById', () => {
    it('should find an organization by id', async () => {
      const mockOrg = {
        id: 'org-123',
        name: 'Test Corp',
        industry: 'Technology',
      }

      vi.mocked(mockRepository.findById).mockResolvedValue(mockOrg as Organization)

      const result = await organizationService.findById('org-123')

      expect(mockRepository.findById).toHaveBeenCalledWith('org-123')
      expect(result).toEqual(mockOrg)
    })

    it('should return null when organization not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      const result = await organizationService.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should find all organizations with pagination', async () => {
      const mockOrgs = [
        { id: 'org-1', name: 'Org 1', industry: 'Tech' },
        { id: 'org-2', name: 'Org 2', industry: 'Finance' },
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockOrgs as Organization[])

      const result = await organizationService.findAll(10, 0)

      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 0)
      expect(result).toEqual(mockOrgs)
    })
  })

  describe('update', () => {
    it('should update an organization', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(1)

      const result = await organizationService.update('org-123', {
        name: 'Updated Corp',
      })

      expect(mockRepository.update).toHaveBeenCalledWith('org-123', {
        name: 'Updated Corp',
      })
      expect(result).toBe(1)
    })

    it('should return 0 when organization not found', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(0)

      const result = await organizationService.update('nonexistent', {
        name: 'Updated Corp',
      })

      expect(result).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete an organization', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(1)

      const result = await organizationService.delete('org-123')

      expect(mockRepository.delete).toHaveBeenCalledWith('org-123')
      expect(result).toBe(1)
    })

    it('should return 0 when organization not found', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(0)

      const result = await organizationService.delete('nonexistent')

      expect(result).toBe(0)
    })
  })

  describe('count', () => {
    it('should count all organizations', async () => {
      vi.mocked(mockRepository.count).mockResolvedValue(5)

      const result = await organizationService.count()

      expect(mockRepository.count).toHaveBeenCalled()
      expect(result).toBe(5)
    })
  })
})
