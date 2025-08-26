import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
import cosmeticUser from '../models/User.js';

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await cosmeticUser.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
