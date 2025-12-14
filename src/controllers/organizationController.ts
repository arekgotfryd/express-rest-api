import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { OrganizationService } from '../services/organizationService.ts'

const organizationService = new OrganizationService()

const attributes = ['id', 'name', 'industry', 'dateFounded']

export const getOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await organizationService.count()

    const organizations = await organizationService.findAll(undefined, {
      attributes,
      limit,
      offset,
    })

    res.json({
      organizations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Get all organizations error', error)
    res.status(500).json({ error: 'Failed to fetch organizations' })
  }
}

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.params.id

    const organization = await organizationService.findById(organizationId, {
      attributes,
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({ organization })
  } catch (error) {
    console.error('Get organization error:', error)
    res.status(500).json({ error: 'Failed to fetch organization' })
  }
}

export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, industry, dateFounded } = req.body
    await organizationService.create({
      name,
      industry,
      dateFounded,
    })

    res.json({ message: 'Organization has been created' })
  } catch (error) {
    console.error('Organizaion create error:', error)
    res.status(500).json({ error: 'Failed to create organization' })
  }
}

export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.params.id
    const { name, industry, dateFounded } = req.body

    const updatedOrgs = await organizationService.update(organizationId, {
      name,
      industry,
      dateFounded,
    })

    if (updatedOrgs[0] === 0) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({
      message: 'Organization updated successfully',
    })
  } catch (error) {
    console.error('Update organization error:', error)
    res.status(500).json({ error: 'Failed to update organization' })
  }
}

export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deletedCount = await organizationService.delete(req.params.id)

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    res.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Delete organization error', error)
    res.status(500).json({ error: 'Failed to delete an organization' })
  }
}
