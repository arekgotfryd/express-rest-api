import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody } from '../middleware/validation.ts'
import {
  createOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
} from '../controllers/organizationController.ts'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validation/organization.ts'

const router = Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Routes
//TODO add paging
router.get('/', getOrganizations)
router.get('/:id', getOrganization)
router.post('/:id', validateBody(createOrganizationSchema), createOrganization)
router.put('/:id', validateBody(updateOrganizationSchema), updateOrganization)
router.delete('/:id', getOrganization)

export default router
