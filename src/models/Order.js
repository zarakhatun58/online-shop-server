import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref:'Product', required:true },
  qty: { type:Number, required:true }
}, { _id:false })

const cosmeticOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  items: [itemSchema],
  amount: { type:Number, required:true },
  address: { type:String, required:true },
  status: { type:String, enum:['pending','paid','failed'], default:'pending' },
  payment: { provider:String, orderId:String, paymentId:String, signature:String }
}, { timestamps:true })

export default mongoose.model('cosmeticOrder', cosmeticOrderSchema)
