import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  date: Date,
  reviewerName: String,
  reviewerEmail: String
}, { _id: false })

const dimensionSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  depth: Number
}, { _id: false })

const metaSchema = new mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String
}, { _id: false })

const cosmeticProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  description: { type: String, default: "" },
  category: { type: String, default: "General" },
  price: { type: Number, required: true },
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  tags: [String],
  brand: String,
  sku: String,
  weight: Number,
  dimensions: dimensionSchema,
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  reviews: [reviewSchema],
  returnPolicy: String,
  minimumOrderQuantity: Number,
  meta: metaSchema,
  images: [String],
  thumbnail: String,
  image: String ,
}, { timestamps: true })

export default mongoose.model("cosmeticProduct", cosmeticProductSchema)
