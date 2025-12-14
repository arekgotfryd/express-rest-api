import { Router } from 'express'
import { register, login } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { loginSchema, registerUserSchema } from '../validation/auth.ts'

const router = Router()

router.post('/register', validateBody(registerUserSchema), register)
router.post('/login', validateBody(loginSchema), login)

export default router
