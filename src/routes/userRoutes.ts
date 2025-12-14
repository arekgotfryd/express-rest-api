import { Router } from 'express'
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody } from '../middleware/validation.ts'
import { updateUserSchema } from '../validation/user.ts'

const router = Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Routes
//TODO add paging
router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', validateBody(updateUserSchema), updateUser)
router.delete('/:id', deleteUser)

export default router
