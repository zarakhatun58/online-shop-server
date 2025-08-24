import { Router } from 'express'
import { listProducts, getProduct,createProduct } from '../controllers/productController.js'
const router = Router()

router.post('/', createProduct)
router.get('/', listProducts)
router.get('/:id', getProduct)

export default router;
