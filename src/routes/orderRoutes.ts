import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody } from '../middleware/validation.ts'
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
} from '../controllers/orderController.ts'
import { createOrderSchema, updateOrderSchema } from '../validation/order.ts'

const router = Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Routes
//TODO add paging
router.get('/', getOrders)
router.get('/:id', getOrder)
router.post('/:id', validateBody(createOrderSchema), createOrder)
router.put('/:id', validateBody(updateOrderSchema), updateOrder)
router.delete('/:id', deleteOrder)

export default router
