import { Router } from 'express'
import { register, login } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { createUserSchema } from '../validation/user.ts'
import { loginSchema } from '../validation/auth.ts'

const router = Router()

router.post('/register', validateBody(createUserSchema), register)
router.post('/login', validateBody(loginSchema), login)

export default router
