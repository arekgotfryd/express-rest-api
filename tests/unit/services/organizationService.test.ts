import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrganizationService } from '../../../src/services/organizationService.ts'
import { Organization } from '../../../src/models/index.ts'

vi.mock('../../../src/models/index.ts', () => ({
  Organization: {
    create: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
  },
  User: {},
  Order: {},
}))

describe('OrganizationService', () => {
  let organizationService: OrganizationService

  beforeEach(() => {
    organizationService = new OrganizationService()
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new organization', async () => {
      const orgData = {
        name: 'Test Corp',
        industry: 'Technology',
        dateFounded: new Date('2020-01-01'),
      }

      const mockOrg = { id: 'org-123', ...orgData }
      vi.mocked(Organization.create).mockResolvedValue(mockOrg as any)

      const result = await organizationService.create(orgData)

      expect(Organization.create).toHaveBeenCalledWith(orgData, undefined)
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

      vi.mocked(Organization.findByPk).mockResolvedValue(mockOrg as any)

      const result = await organizationService.findById('org-123')

      expect(Organization.findByPk).toHaveBeenCalledWith('org-123', undefined)
      expect(result).toEqual(mockOrg)
    })
  })

  describe('update', () => {
    it('should update an organization', async () => {
      vi.mocked(Organization.update).mockResolvedValue([1] as any)

      const result = await organizationService.update('org-123', {
        name: 'Updated Corp',
      })

      expect(Organization.update).toHaveBeenCalledWith(
        { name: 'Updated Corp' },
        { where: { id: 'org-123' } }
      )
      expect(result).toEqual([1])
    })
  })

  describe('delete', () => {
    it('should delete an organization', async () => {
      vi.mocked(Organization.destroy).mockResolvedValue(1)

      const result = await organizationService.delete('org-123')

      expect(Organization.destroy).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      })
      expect(result).toBe(1)
    })
  })

  describe('count', () => {
    it('should count all organizations', async () => {
      vi.mocked(Organization.count).mockResolvedValue(5)

      const result = await organizationService.count()

      expect(result).toBe(5)
    })
  })
})
