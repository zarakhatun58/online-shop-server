import { getIO, onlineUsers } from "../config/socket.js"


export const sendNotification = (userId, event, payload) => {
  const io = getIO()
  const socketId = onlineUsers.get(userId)

  if (socketId) {
    io.to(socketId).emit(event, payload)
    console.log(`📩 Sent ${event} to user ${userId}`)
  } else {
    console.log(`⚠️ User ${userId} not online, could not send ${event}`)
  }
}
