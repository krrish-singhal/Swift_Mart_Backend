const userModel = require("../../models/userModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Setup email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });
};

// Send email with retry logic
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  const transporter = createTransporter();
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send email to ${mailOptions.to}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      if (attempt < maxRetries) {
        const delay = 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "https://swift-3of27ebi7-krrish-singhals-projects.vercel.app"}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"E-Commerce Support" <${process.env.EMAIL_USER}>`, // Better format
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Click the button below:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
          </div>
          <p>If you didn’t request this, you can ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #999;">This is an automated email from our system. Please add us to your contacts to avoid missing future emails.</p>
        </div>
      `,
      text: `Click to reset your password: ${resetUrl}`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
      },
    };

    await sendEmailWithRetry(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email address.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = forgotPasswordController;
