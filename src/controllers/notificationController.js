import cosmeticNotification from '../models/notification.js';
import { sendNotification } from "../utils/sendNotification.js";

export const notifyNow = async (req, res) => {
  const { userId, title, message, type } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const notification = await cosmeticNotification.create({
      userId,
      title,
      message,
      type,
    });

    sendNotification(userId, "notification", {
      id: notification._id,
      title,
      message,
      type,
      createdAt: notification.createdAt,
    });

    res.status(200).json({ message: "Notification sent", notification });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Failed to send notification" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await cosmeticNotification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await cosmeticNotification.findByIdAndUpdate(id, { read: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await cosmeticNotification.updateMany({ userId }, { read: true });
    res.json({ message: "All marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};
