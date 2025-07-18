const userModel = require("../../models/userModel");

const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Check if token and password are provided
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
        error: true,
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: true,
      });
    }

    // Find user with valid reset token that is not expired
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    // If no user or token is expired
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        error: true,
      });
    }

    // ✅ Assign plain text password — schema will auto-hash it
    user.password = password;

    // Clear token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Save updated user (schema will hash password)
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: true,
    });
  }
};

module.exports = resetPasswordController;
