
import express, { Router } from 'express'
import {
  createCheckoutSession,
  updateOrderStatus,
  getOrders,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();

router.post('/checkout', protect, createCheckoutSession);
router.get('/all', protect, getOrders);
router.put('/status', protect, updateOrderStatus);

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
