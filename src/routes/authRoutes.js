import express from 'express';
import { register, login, getProfile, logout, forgotPassword, resetPassword,loginWithGoogle} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/logout', logout);
router.post('/googleLogin', loginWithGoogle);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
