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
    const organizations = await organizationService.findAll(undefined, {
      attributes,
    })
    res.json({ organizations })
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
