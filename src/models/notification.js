import mongoose from "mongoose";

const cosmeticNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "cosmeticUser", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "error"], default: "info" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("cosmeticNotification", cosmeticNotificationSchema);