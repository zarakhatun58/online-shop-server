import { Router } from 'express';
import {
  createCheckoutSession,
  getOrders,
  updatePaymentStatus,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();

router.post('/checkout', protect, createCheckoutSession);
router.get('/', protect, getOrders);
router.put('/payment', protect, updatePaymentStatus);

// Stripe webhook (no auth, secret verified inside controller)
router.post('/webhook', stripeWebhook);

export default router;
