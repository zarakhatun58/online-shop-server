import { Router } from 'express'
import { listProducts, getProduct,createProduct , updateProduct, deleteProduct} from '../controllers/productController.js'
import { isAdmin } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/multer.js';
const router = Router()

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createProduct
);

// Update product
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateProduct
);
router.get('/', listProducts)
router.get('/:id', getProduct)
router.delete('/:id', deleteProduct)

export default router;
