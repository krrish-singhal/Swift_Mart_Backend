const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSignInController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", success: false, error: true });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false, error: true });
    }

    if (user.isGoogleUser) {
      return res.status(403).json({
        message: "This email is registered via Google. Please log in using Google.",
        success: false,
        error: true,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password", success: false, error: true });
    }

    const tokenData = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || "",
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = userSignInController;
