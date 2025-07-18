const olxOrderModel = require("../../models/olxOrderModel")

const myPurchasesController = async (req, res) => {
  try {
    const purchases = await olxOrderModel
      .find({ buyer: req.user._id })
      .populate("product")
      .populate("seller", "name email")
      .sort({ createdAt: -1 })

    console.log("Found purchases:", purchases.length)

    res.status(200).json({
      success: true,
      purchases,
    })
  } catch (error) {
    console.error("Error fetching purchases:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = myPurchasesController
