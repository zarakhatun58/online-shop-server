import cosmeticProduct from '../models/Product.js'


// ✅ Create product
export const createProduct = async (req, res) => {
  try {
    let payload = req.body

    // If bulk insert
    if (Array.isArray(payload.products)) {
      payload = payload.products.map((p) => {
        if (p.title && !p.name) p.name = p.title
        if (p.price === undefined || p.price === null) {
          throw new Error("Price is required")
        }
        return { ...p, price: Number(p.price) }
      })
      const saved = await cosmeticProduct.insertMany(payload)
      return res.status(201).json(saved)
    }

    // If single insert
    if (payload.title && !payload.name) {
      payload.name = payload.title
      delete payload.title
    }
    if (payload.price === undefined || payload.price === null) {
      return res.status(400).json({ message: "Price is required" })
    }
    payload.price = Number(payload.price)

    const product = new cosmeticProduct(payload)
    const saved = await product.save()
    res.status(201).json(saved)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message || "Failed to create product" })
  }
}


export const listProducts = async (req, res) => {
  const q = req.query.q?.toLowerCase()
  let filter = {}
  if (q) {
    filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    }
  }
  const items = await cosmeticProduct.find(filter).sort({ createdAt: -1 })
  res.json(items)
}

export const getProduct = async (req, res) => {
  const item = await cosmeticProduct.findById(req.params.id)
  if (!item) return res.status(404).json({ message: 'Not found' })
  res.json(item)
}
