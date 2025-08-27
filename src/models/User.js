import mongoose from 'mongoose';

const cosmeticUserSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true },
  username: String,
  profilePic: String,
   role: { type: String, enum: ["user", "admin"], default: "user" },
  password: String,
   address: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('cosmeticUser', cosmeticUserSchema)
