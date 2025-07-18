const olxProductModel = require("../../models/olxProductModel")

const updateProductStatusController = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      })
    }

    const { productId, status } = req.body

    if (!productId || !status) {
      return res.status(400).json({
        success: false,
        message: "Product ID and status are required",
      })
    }

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      })
    }

    // Find and update the product
    const product = await olxProductModel.findById(productId)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Update status
    product.status = status
    await product.save()

    res.status(200).json({
      success: true,
      message: `Product status updated to ${status}`,
      product,
    })
  } catch (error) {
    console.error("Error updating product status:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update product status",
      error: error.message,
    })
  }
}

module.exports = updateProductStatusController
