import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoute.js'
import orderRoutes from './routes/orderRoute.js'
import paymentRoutes from './routes/paymentRoute.js'

dotenv.config()
const app = express()

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'], credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

await connectDB()

app.get('/', (_,res)=> res.json({ ok:true, service:'ecommerce-server' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)

app.use((err, req, res, next)=>{
  console.error(err)
  res.status(500).json({ message: 'Server error', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log('Server running on :' + PORT))
