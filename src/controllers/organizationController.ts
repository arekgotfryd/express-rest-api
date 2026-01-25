import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { container } from '../container.ts'
import { logger } from '../utils/logger.ts'
import {
  toOrganizationDTO,
  toOrganizationDTOList,
  toPaginationDTO,
} from '../dtos/mappers.ts'
import type {
  OrganizationsResponseDTO,
  OrganizationResponseDTO,
  MessageDTO,
  ErrorDTO,
} from '../dtos/index.ts'

const attributes = ['id', 'name', 'industry', 'dateFounded']

export const getOrganizations = async (
  req: AuthenticatedRequest,
  res: Response<OrganizationsResponseDTO | ErrorDTO>,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await container.organizationService.count()

    const organizations = await container.organizationService.findAll(
      limit,
      offset,
    )

    res.json({
      organizations: toOrganizationDTOList(organizations),
      pagination: toPaginationDTO(page, limit, totalCount),
    })
  } catch (error) {
    logger.error('Get all organizations error', error)
    res.status(500).json({ error: 'Failed to fetch organizations' })
  }
}

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response<OrganizationResponseDTO | ErrorDTO>,
) => {
  try {
    const organizationId = req.params.id

    const organization =
      await container.organizationService.findById(organizationId)

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({ organization: toOrganizationDTO(organization) })
  } catch (error) {
    logger.error('Get organization error:', error)
    res.status(500).json({ error: 'Failed to fetch organization' })
  }
}

export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>,
) => {
  try {
    const { name, industry, dateFounded } = req.body
    await container.organizationService.save({
      name,
      industry,
      dateFounded,
    })

    res.status(201).json({ message: 'Organization has been created' })
  } catch (error) {
    logger.error('Organizaion create error:', error)
    res.status(500).json({ error: 'Failed to create organization' })
  }
}

export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>,
) => {
  try {
    const organizationId = req.params.id
    const { name, industry, dateFounded } = req.body

    const updatedCount = await container.organizationService.update(
      organizationId,
      {
        name,
        industry,
        dateFounded,
      },
    )

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({
      message: 'Organization updated successfully',
    })
  } catch (error) {
    logger.error('Update organization error:', error)
    res.status(500).json({ error: 'Failed to update organization' })
  }
}

export const deleteOrganization = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>,
) => {
  try {
    const deletedCount = await container.organizationService.delete(
      req.params.id,
    )

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    logger.error('Delete organization error', error)
    res.status(500).json({ error: 'Failed to delete an organization' })
  }
}
