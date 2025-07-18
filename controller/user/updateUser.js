const userModel = require("../../models/userModel")

const updateUserDetails = async (req, res) => {
  try {
    const { email, role, userId } = req.body

    // Check if the current user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can update user roles",
        error: true,
      })
    }

    // Find and update the user
    const user = await userModel.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: true,
      })
    }

    // Update the role
    user.role = role
    await user.save()

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: true,
    })
  }
}

module.exports = updateUserDetails
