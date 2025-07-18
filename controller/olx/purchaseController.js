const stripe = require("../../config/stripe")
const olxProductModel = require("../../models/olxProductModel")

const purchaseController = async (req, res) => {
  try {
    const { productId } = req.body

    const product = await olxProductModel.findById(productId).populate("userId", "name email")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
              description: product.description,
              images: product.images.slice(0, 1),
            },
            unit_amount: product.sellingPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/olx-success`,
      cancel_url: `${process.env.FRONTEND_URL}/olx-marketplace`,
      metadata: {
        productId: product._id.toString(),
        userId: req.user._id.toString(),
        sellerId: product.userId._id.toString(),
        paymentType: "olx_purchase",
      },
    })

    res.status(200).json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error("Error creating purchase:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = purchaseController
