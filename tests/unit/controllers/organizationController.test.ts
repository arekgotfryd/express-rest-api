import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../../src/middleware/auth.ts'

vi.mock('../../../src/container.ts', () => ({
  container: {
    organizationService: {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      findByIndustry: vi.fn(),
    },
  },
}))

vi.mock('../../../src/utils/logger.ts', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  }
  return {
    logger: mockLogger,
    default: mockLogger,
  }
})

// Import after mocking
const {
  createOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
} = await import('../../../src/controllers/organizationController.ts')

const { container } = await import('../../../src/container.ts')

describe('Organization Controller', () => {
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      },
      params: {},
      body: {},
      query: {},
    }

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    vi.clearAllMocks()
  })

  describe('createOrganization', () => {
    it('should create an organization', async () => {
      const orgData = {
        name: 'Test Company',
        industry: 'Technology',
      }

      const createdOrg = {
        id: 'org-123',
        ...orgData,
      }

      mockRequest.body = orgData
      vi.mocked(container.organizationService.create).mockResolvedValue(
        createdOrg as any
      )

      await createOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.organizationService.create).toHaveBeenCalledWith(orgData)
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Organization has been created',
      })
    })

    it('should handle creation errors', async () => {
      mockRequest.body = { name: 'Test Company' }

      vi.mocked(container.organizationService.create).mockRejectedValue(
        new Error('Creation failed')
      )

      await createOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create organization',
      })
    })
  })

  describe('getOrganization', () => {
    it('should return an organization by id', async () => {
      const organization = {
        id: 'org-123',
        name: 'Test Company',
        industry: 'Technology',
      }

      mockRequest.params = { id: 'org-123' }
      vi.mocked(container.organizationService.findById).mockResolvedValue(
        organization as any
      )

      await getOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.organizationService.findById).toHaveBeenCalledWith(
        'org-123',
        expect.anything()
      )
      expect(mockResponse.json).toHaveBeenCalledWith({ organization })
    })

    it('should return 404 if organization not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      vi.mocked(container.organizationService.findById).mockResolvedValue(null)

      await getOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Organization not found',
      })
    })
  })

  describe('updateOrganization', () => {
    it('should update an organization', async () => {
      const updateData = { name: 'Updated Company' }
      const updatedOrg = {
        id: 'org-123',
        name: 'Updated Company',
        industry: 'Technology',
      }

      mockRequest.params = { id: 'org-123' }
      mockRequest.body = updateData

      vi.mocked(container.organizationService.findById).mockResolvedValue(
        updatedOrg as any
      )
      vi.mocked(container.organizationService.update).mockResolvedValue([1])

      await updateOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.organizationService.update).toHaveBeenCalledWith(
        'org-123',
        updateData
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Organization updated successfully',
      })
    })

    it('should return 404 if organization not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      mockRequest.body = { name: 'Updated Company' }

      vi.mocked(container.organizationService.findById).mockResolvedValue(null)
      vi.mocked(container.organizationService.update).mockResolvedValue([0])

      await updateOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Organization not found',
      })
    })
  })

  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      mockRequest.params = { id: 'org-123' }
      vi.mocked(container.organizationService.delete).mockResolvedValue(1)

      await deleteOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(container.organizationService.delete).toHaveBeenCalledWith(
        'org-123'
      )
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Organization deleted successfully',
      })
    })

    it('should return 404 if organization not found', async () => {
      mockRequest.params = { id: 'nonexistent' }
      vi.mocked(container.organizationService.delete).mockResolvedValue(0)

      await deleteOrganization(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Organization not found',
      })
    })
  })
})
