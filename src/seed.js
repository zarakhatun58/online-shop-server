import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Product from './models/Product.js'

dotenv.config()

const products = [
  { name:'Glow Serum', description:'Vitamin C serum', price:499, stock:50, category:'Skincare', image:'https://via.placeholder.com/600x400?text=Glow+Serum' },
  { name:'Matte Lipstick', description:'Long wear lipstick', price:299, stock:120, category:'Makeup', image:'https://via.placeholder.com/600x400?text=Matte+Lipstick' },
  { name:'Herbal Shampoo', description:'SLS-free shampoo', price:349, stock:80, category:'Haircare', image:'https://via.placeholder.com/600x400?text=Herbal+Shampoo' }
]

try {
  await connectDB()
  await Product.deleteMany({})
  await Product.insertMany(products)
  console.log('Seed complete')
  process.exit(0)
} catch (e) {
  console.error(e)
  process.exit(1)
}
