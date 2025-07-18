const olxProductModel = require("../../models/olxProductModel")

const productsController = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort = "newest", status = "approved" } = req.query

    console.log("🔍 Fetching products with filters:", { category, minPrice, maxPrice, search, sort, status })

    // Build query - ONLY show approved products for marketplace
    const query = { status: "approved" }

    // Filter by category
    if (category && category !== "all categories") {
      query.category = category.toLowerCase()
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.sellingPrice = {}
      if (minPrice) query.sellingPrice.$gte = Number(minPrice)
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice)
    }

    // Search by name or description
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    console.log("📋 Final query:", JSON.stringify(query, null, 2))

    // Sort options
    let sortOption = {}
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 }
        break
      case "oldest":
        sortOption = { createdAt: 1 }
        break
      case "price_low":
        sortOption = { sellingPrice: 1 }
        break
      case "price_high":
        sortOption = { sellingPrice: -1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    // Execute query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const products = await olxProductModel
      .find(query)
      .populate("userId", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)

    const total = await olxProductModel.countDocuments(query)

    console.log(`✅ Found ${products.length} products out of ${total} total`)

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
    console.error("❌ Error fetching products:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    })
  }
}

module.exports = productsController
