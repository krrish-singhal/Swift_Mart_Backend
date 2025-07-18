const olxProductModel = require("../../models/olxProductModel")

const productDetailController = async (req, res) => {
  try {
    const { productId } = req.params

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      })
    }

    // Find the product with seller details
    const product = await olxProductModel.findById(productId).populate("userId", "name email createdAt")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check if the user is the owner of the product
    const isOwner = req.user && req.user._id.toString() === product.userId._id.toString()

    // Regular users can only view approved products unless they are the owner
    if (product.status !== "approved" && !isOwner && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this product",
      })
    }

    // Add isOwner flag to response
    const productData = product.toObject()
    productData.isOwner = isOwner
    productData.seller = product.userId

    res.status(200).json({
      success: true,
      product: productData,
    })
  } catch (error) {
    console.error("Error fetching product details:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
      error: error.message,
    })
  }
}

module.exports = productDetailController
