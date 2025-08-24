import { Router } from 'express'
import { createRazorpayOrder, verifyRazorpaySignature } from '../controllers/paymentController.js'
import { protect } from '../middleware/authMiddleware.js'
const router = Router()
router.post('/razorpay/order', protect, createRazorpayOrder)
router.post('/razorpay/verify', protect, verifyRazorpaySignature)

export default router;
