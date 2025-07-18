const olxProductModel = require("../../models/olxProductModel")

const adminProductsController = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      })
    }

    const { status = "pending" } = req.query

    // Build query
    const query = {}

    // Filter by status
    if (status && status !== "all") {
      query.status = status
    }

    // Execute query with pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const products = await olxProductModel
      .find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await olxProductModel.countDocuments(query)

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching admin products:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    })
  }
}

module.exports = adminProductsController
