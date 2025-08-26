import Otp from "../models/CosmeticOtp.js";
import twilio from "twilio";  

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

 const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp, expiresAt });

    if (phone) {
      await client.messages.create({
        body: `Your OTP is ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: phone,
      });
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export default sendOtp;