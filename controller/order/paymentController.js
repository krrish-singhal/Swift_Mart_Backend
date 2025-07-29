const stripe = require("../../config/stripe")

const paymentController = async (req, res) => {
  try {
    const { cartItems } = req.body
    const userId = req.userId

    if (!cartItems || !cartItems.length) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required",
        error: true,
      })
    }

    // Log cart items for debugging
    console.log(`Processing checkout for user ${userId} with ${cartItems.length} items`)
    
    // Create line items for Stripe
    const lineItems = cartItems.map((item) => {
      // Ensure product ID is valid and converted to string
      const productId = item.productId && item.productId._id ? item.productId._id.toString() : "unknown"
      
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.productId.productName || "Product",
            description: item.productId.description || "",
            images: item.productId.productImage || [],
            metadata: {
              productId: productId,
            },
          },
          unit_amount: Math.round(item.productId.sellingPrice * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }
    })

    // Get cart item IDs for later deletion - ensure they're strings
    const cartItemIds = cartItems
      .map((item) => (item._id ? item._id.toString() : null))
      .filter(id => id !== null)
    
    console.log(`Cart item IDs for deletion: ${cartItemIds.join(',')}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "https://swift-3of27ebi7-krrish-singhals-projects.vercel.app"}/success?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || "https://swift-3of27ebi7-krrish-singhals-projects.vercel.app"}/cart`,
      shipping_address_collection: {
        allowed_countries: ["IN", "US", "CA", "GB"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 10000, // ₹100 in paise
              currency: "inr",
            },
            display_name: "Standard shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 3,
              },
              maximum: {
                unit: "business_day",
                value: 5,
              },
            },
          },
        },
      ],
      customer_email: req.userEmail || undefined,
      metadata: {
        userId: userId.toString(),
        cartItemIds: cartItemIds.join(','),
        cartItemCount: cartItems.length.toString(),
      },
    })

    console.log(`Stripe session created: ${session.id}`);
    
    res.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error("Payment controller error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error: true,
    })
  }
}

module.exports = paymentController