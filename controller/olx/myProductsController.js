// controller/olx/myProductsController.js
const olxProductModel = require("../../models/olxProductModel");

const myProductsController = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find all products where the user is the seller
    const products = await olxProductModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your products",
      error: error.message,
    });
  }
};

module.exports = myProductsController;