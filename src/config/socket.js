
import { Server } from "socket.io";
import cosmeticNotification from '../models/notification.js';

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("register", async (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`📌 User ${userId} registered with socket ${socket.id}`);

      const CosmeticNotification = (await import("../models/CosmeticNotification.js")).default;
      const queued = await CosmeticNotification.find({ userId, read: false });
      for (const n of queued) {
        io.to(socket.id).emit("notification", {
          title: n.title,
          message: n.message,
          type: n.type,
        });
      }
      await cosmeticNotification.updateMany({ userId, read: false }, { read: true });
    });

    socket.on("disconnect", () => {
      for (let [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export { onlineUsers };