const userModel = require("../../models/userModel")

const verifyResetTokenController = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
        error: true,
      })
    }

    // Find user with valid reset token
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Token must not be expired
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        error: true,
      })
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
    })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: true,
    })
  }
}

module.exports = verifyResetTokenController
