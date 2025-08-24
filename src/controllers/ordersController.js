import cosmeticOrder from '../models/Order.js'

export const createOrder = async (req,res)=>{
  const { items, amount, address } = req.body
  if (!items?.length) return res.status(400).json({ message:'No items' })
  if (!amount || amount <= 0) return res.status(400).json({ message:'Invalid amount' })
  if (!address) return res.status(400).json({ message:'Address required' })
  const order = await cosmeticOrder.create({ user:req.user._id, items, amount, address, status:'pending' })
  res.status(201).json(order)
}

export const myOrders = async (req,res)=>{
  const orders = await cosmeticOrder.find({ user:req.user._id }).sort({ createdAt: -1 }).populate('items.product')
  res.json(orders)
}
