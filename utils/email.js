// backend/utils/email.js
import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  try {
    // Create transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change to "outlook", "hotmail", "yahoo", etc.
      auth: {
        user: process.env.EMAIL_USER,     // Your email
        pass: process.env.EMAIL_PASS,     // App password
      },
    });

    // Email content
    const mailOptions = {
      from: `"SA Online Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your Verification Code</h2>
          <p>Your OTP code is:</p>
          <h1 style="background: #f3f3f3; display: inline-block; padding: 10px 20px; border-radius: 8px;">
            ${otp}
          </h1>
          <p>This code will expire in <b>5 minutes</b>.</p>
          <br />
          <small>If you did not request this, please ignore this email.</small>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`📧 Sending OTP ${otp} to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
    return false;
  }
};
