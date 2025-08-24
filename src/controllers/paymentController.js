import Razorpay from 'razorpay'
import crypto from 'crypto'
import cosmeticOrder from '../models/Order.js'

const razor = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ? new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET}) : null

export const createRazorpayOrder = async (req,res)=>{
  if (!razor) return res.status(400).json({ message:'Razorpay not configured' })
  const { amount, currency='INR', receipt } = req.body
  if (!amount || amount<=0) return res.status(400).json({ message:'Invalid amount' })
  try {
    const o = await razor.orders.create({ amount: Math.round(amount*100), currency, receipt: receipt || 'rcpt_'+Date.now() })
    res.json(o)
  } catch (e) {
    res.status(500).json({ message:'RP order failed', error: e.message })
  }
}

export const verifyRazorpaySignature = async (req,res)=>{
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, server_order_id } = req.body
  const data = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(data).digest('hex')
  if (expected !== razorpay_signature) return res.status(400).json({ message:'Invalid signature' })
  if (server_order_id) {
    await cosmeticOrder.findByIdAndUpdate(server_order_id, { status:'paid', payment:{ provider:'razorpay', orderId:razorpay_order_id, paymentId:razorpay_payment_id, signature:razorpay_signature } })
  }
  res.json({ status:'ok' })
}
