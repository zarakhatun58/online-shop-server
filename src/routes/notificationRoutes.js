import express from 'express';
import {
  notifyNow,
  getUserNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/notify-now',protect, notifyNow);
router.get('/:userId', protect, getUserNotifications);
router.put('/read/:id', protect, markAsRead);
router.put('/read-all/:userId',protect, markAllAsRead);

export default router;
