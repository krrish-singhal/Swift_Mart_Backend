// controller/olx/adminProductCountsController.js
const olxProductModel = require("../../models/olxProductModel");

const adminProductCountsController = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Get counts for each status
    const all = await olxProductModel.countDocuments();
    const pending = await olxProductModel.countDocuments({ status: "pending" });
    const approved = await olxProductModel.countDocuments({ status: "approved" });
    const rejected = await olxProductModel.countDocuments({ status: "rejected" });

    res.status(200).json({
      success: true,
      counts: {
        all,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    console.error("Error fetching product counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product counts",
      error: error.message,
    });
  }
};

module.exports = adminProductCountsController;