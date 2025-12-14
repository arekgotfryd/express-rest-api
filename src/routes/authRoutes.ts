import { Router } from 'express'
import { register, login } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { insertUserSchema } from '../validation/user.ts'
import { loginSchema } from '../validation/auth.ts'

const router = Router()

router.post('/register', validateBody(insertUserSchema), register)
router.post('/login', validateBody(loginSchema), login)

export default router
