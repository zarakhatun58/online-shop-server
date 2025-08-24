import { Router } from 'express';
import {
  createCheckoutSession,
  updatePaymentStatus,
  getOrders,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();

router.post('/checkout', protect, createCheckoutSession);
router.get('/', protect, getOrders);
router.put('/payment', protect, updatePaymentStatus);

router.post('/webhook', stripeWebhook);

export default router;
