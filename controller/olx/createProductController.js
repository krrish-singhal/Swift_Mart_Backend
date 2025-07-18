const olxProductModel = require("../../models/olxProductModel")
const cloudinary = require("../../config/cloudinary")
const fs = require("fs")

const createProductController = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { name, category, worthPrice, sellingPrice, description, reason } = req.body

    // Validate required fields
    if (!name || !category || !worthPrice || !sellingPrice || !description || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Validate prices
    if (isNaN(worthPrice) || isNaN(sellingPrice) || Number(worthPrice) <= 0 || Number(sellingPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price values",
      })
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      })
    }

    // Upload images to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          file.path,
          {
            folder: "olx_products",
            resource_type: "image",
          },
          (error, result) => {
            // Clean up local file
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr) console.error("Error deleting local file:", unlinkErr)
            })

            if (error) {
              reject(error)
            } else {
              resolve(result.secure_url)
            }
          },
        )
      })
    })

    const imageUrls = await Promise.all(uploadPromises)

    // Create new product
    const product = new olxProductModel({
      name,
      category,
      worthPrice,
      sellingPrice,
      description,
      reason,
      images: imageUrls,
      userId: req.user._id,
      status: "pending", // Default status is pending
      paymentStatus: "pending", // Payment status starts as pending
    })

    await product.save()

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: product._id,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    })
  }
}

module.exports = createProductController
