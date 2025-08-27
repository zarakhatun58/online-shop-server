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

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await cosmeticUser.findById(decoded.id);

    console.log("Token:", token);
    console.log("Decoded:", decoded);
    console.log("User role:", user?.role);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};