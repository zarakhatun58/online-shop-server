import cosmeticProduct from '../models/Product.js'


// ✅ Create product
export const createProduct = async (req, res) => {
  try {
    const payload = req.body;

    // Attach uploaded files
    if (req.files) {
      if (req.files.image) payload.image = `/uploads/products/${req.files.image[0].filename}`;
      if (req.files.thumbnail) payload.thumbnail = `/uploads/products/${req.files.thumbnail[0].filename}`;
      if (req.files.images) {
        payload.images = req.files.images.map(file => `/uploads/products/${file.filename}`);
      }
    }

    const product = new cosmeticProduct(payload);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to create product" });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const product = await cosmeticProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, req.body);
    if (req.body.price) product.price = Number(req.body.price);

    // Attach updated files
    if (req.files) {
      if (req.files.image) product.image = `/uploads/products/${req.files.image[0].filename}`;
      if (req.files.thumbnail) product.thumbnail = `/uploads/products/${req.files.thumbnail[0].filename}`;
      if (req.files.images) {
        product.images = req.files.images.map(file => `/uploads/products/${file.filename}`);
      }
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await cosmeticProduct.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    await product.remove()
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
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
