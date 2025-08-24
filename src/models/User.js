import mongoose from 'mongoose';

const cosmeticUserSchema = new mongoose.Schema({
 googleId: String,
   email: { type: String, required: true, unique: true },
  username: String,
  profilePic: String,
  password: String,
   address: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('cosmeticUser', cosmeticUserSchema)
