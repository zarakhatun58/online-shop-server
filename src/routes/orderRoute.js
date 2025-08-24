import { Router } from 'express'
import { createOrder, myOrders } from '../controllers/ordersController.js'
import { protect } from '../middleware/authMiddleware.js'
const router= Router()
router.post('/', protect, createOrder)
router.get('/me', protect, myOrders)


export default router;
