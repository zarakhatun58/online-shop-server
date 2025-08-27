import { getIO, onlineUsers } from "../config/socket.js"
import cosmeticNotification from '../models/notification.js';

export const sendNotification = async (userId, event, payload) => {
  const io = getIO();
  const socketId = onlineUsers.get(userId);

  if (socketId) {
    io.to(socketId).emit(event, payload);
    console.log(`📩 Sent ${event} to user ${userId}`);
  } else {
    await cosmeticNotification.create({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
    });
    console.log(`⏳ User ${userId} offline, queued ${event} notification`);
  }
};
