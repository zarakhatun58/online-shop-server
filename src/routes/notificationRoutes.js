import express from 'express';
import {
  notifyNow,
  getUserNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/notify-now', notifyNow);
router.get('/:userId', getUserNotifications);
router.put('/read/:id', markAsRead);
router.put('/read-all/:userId', markAllAsRead);

export default router;
