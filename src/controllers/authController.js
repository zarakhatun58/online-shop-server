import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cosmeticUser from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import cosmeticOtp from "../models/CosmeticOtp.js";
import crypto from "crypto";
import { sendNotification } from '../utils/sendNotification.js';
import { sendEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) => {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existing = await cosmeticUser.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    if (!username || username.trim() === "") {
      username = email.split("@")[0] + Math.floor(Math.random() * 1000);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await cosmeticUser.create({
      username,
      email,
      password: hashed,
      role: role || "user",
    });

    const token = signToken(user);

    await sendNotification(user._id.toString(), "notification", {
      title: "Welcome 🎉",
      message: `Welcome ${user.username}! Your account has been created.`,
      type: "success",
    });

    res.status(201).json({
      user: {
        _id: user._id,  
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || null,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
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
    await sendNotification(user._id.toString(), "notification", {
      title: "Login Successful ✅",
      message: `Hi ${user.username}, you have successfully logged in.`,
      type: "success",
    });
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email, profilePic: user.profilePic || null, role: user.role, } });
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

    const { sub: _id, email, name, picture } = payload;

    let user = await cosmeticUser.findOne({ email });
    if (!user) {
      user = await cosmeticUser.create({ _id, email, username: name, profilePic: picture });
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
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await cosmeticUser.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await cosmeticOtp.deleteMany({ email });
    await cosmeticOtp.create({ email, otp, expiresAt });

    await sendEmail(
      email,
      "Your OTP Code",
      `<p>Your OTP code is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    );

    res.json({ message: "OTP sent successfully to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: err.message || "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await cosmeticOtp.findOne({ email });

  if (!record) return res.status(400).json({ error: "OTP not found" });
  if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  record.verified = true; 
  await record.save();

  res.json({ message: "OTP verified successfully" });
};


export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const record = await cosmeticOtp.findOne({ email });
  if (!record) return res.status(400).json({ error: "OTP not requested" });
  if (!record.verified) return res.status(400).json({ error: "OTP not verified" });
  if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" });

  const user = await cosmeticUser.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await cosmeticOtp.deleteMany({ email });

  res.json({ message: "Password reset successfully" });
};


