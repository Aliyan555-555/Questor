import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email) => {
  const otp = generateOTP();

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Your OTP Code",
    html: `
      <div style="
        font-family: Arial, sans-serif; 
        padding: 20px; 
        text-align: center; 
        background: url('http://dev.meteoricsolutions.com:8000/images/UI/authBG.png') no-repeat center center;
        background-size: cover;
        min-height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        border-radius: 10px;
      ">
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #FBA732; margin-bottom: 10px;">Your OTP Code</h2>
          <p style="color: #ffffff; font-size: 16px;">Use the following OTP to complete your verification:</p>
          <h1 style="font-size: 28px; font-weight: bold; color: #FBA732; margin: 10px 0;">${otp}</h1>
          <p style="margin-top: 20px; color: #cccccc; font-size: 14px;">This OTP is valid for 5 minutes.</p>
        </div>
      </div>
    `,
  };  

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    return otp;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
