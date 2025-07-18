const stripe = require("../../config/stripe")
const olxProductModel = require("../../models/olxProductModel")

const listingPaymentController = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      })
    }

    // Find the product
    const product = await olxProductModel.findById(productId)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Verify product belongs to the user
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to list this product",
      })
    }

    // Check if payment is already made
    if (product.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Listing fee already paid for this product",
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Listing Fee for " + product.name,
              description: "One-time fee to list your product on our marketplace",
            },
            unit_amount: 10000, // ₹100 in paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/olx-success?type=listing`,
      cancel_url: `${process.env.FRONTEND_URL}/olx-marketplace`,
      metadata: {
        productId: product._id.toString(),
        userId: req.user._id.toString(),
        paymentType: "olx_listing",
      },
    })

    res.status(200).json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error("Error creating listing payment:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create payment session",
      error: error.message,
    })
  }
}

module.exports = listingPaymentController
