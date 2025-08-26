import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cosmeticUser from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import sendOTP from "../utils/sendOTP.js";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) => {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await cosmeticUser.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    if (!username || username.trim() === '') {
      username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await cosmeticUser.create({ username, email, password: hashed });

    const token = signToken(user);

    res.status(201).json({
      user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic || null },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await cosmeticUser.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = signToken(user);

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic || null } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const loginWithGoogle = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Invalid Google token' });

    const { sub: googleId, email, name, picture } = payload;

    let user = await cosmeticUser.findOne({ email });
    if (!user) {
      user = await cosmeticUser.create({ googleId, email, username: name, profilePic: picture });
    }

    const appToken = signToken(user);

    res.json({ token: appToken, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Google login failed' });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await cosmeticUser.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};


export const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
  res.json({ message: 'Logged out successfully' });
};

const otpStore = {};

export const forgotPassword = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await cosmeticUser.findOne({ phone });
    if (!user) return res.status(404).json({ error: "Phone number not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    await sendOTP(phone, otp);

    res.json({ message: "OTP sent via SMS" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body
  const record = otpStore[phone]

  if (!record) return res.status(400).json({ error: "OTP not found" })
  if (Date.now() > record.expires) return res.status(400).json({ error: "OTP expired" })
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" })

  res.json({ message: "OTP verified" })
}


export const resetPassword = async (req, res) => {
  const { phone, otp, newPassword } = req.body
  try {
    const record = otpStore[phone]
    if (!record) return res.status(400).json({ error: "OTP not requested" })
    if (Date.now() > record.expires) return res.status(400).json({ error: "OTP expired" })
    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" })

    const user = await cosmeticUser.findOne({ phone })
    if (!user) return res.status(404).json({ error: "User not found" })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    delete otpStore[phone] 

    res.json({ message: "Password reset successfully" })
  } catch (err) {
    res.status(500).json({ error: "Error resetting password" })
  }
}
