import cosmeticOtp from "../models/CosmeticOtp.js";
import twilio from "twilio";  

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendOtpSms = async (phone, otp) => {
  return client.messages.create({
    body: `Your OTP is ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
};

 const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await cosmeticOtp.deleteMany({ phone });
    await cosmeticOtp.create({ phone, otp, expiresAt });

    await sendOtpSms(phone, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export default sendOtp;