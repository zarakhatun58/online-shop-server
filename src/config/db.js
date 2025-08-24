import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI missing')
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('Mongo connected')
}
export default connectDB
