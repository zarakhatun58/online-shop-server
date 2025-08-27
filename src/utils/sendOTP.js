import cosmeticOtp from "../models/CosmeticOtp.js";
import twilio from "twilio";  

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const sendOtp = async (phone, otp) => {
 try {
    await client.messages.create({
      body: `Your OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    return true;
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw new Error("Failed to send OTP");
  }
};

export default sendOtp;