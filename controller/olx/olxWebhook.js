const stripe = require("../../config/stripe")
const olxOrderModel = require("../../models/olxOrderModel")
const olxProductModel = require("../../models/olxProductModel")

const webhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_OLX)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    if (session.metadata.paymentType === "olx_purchase") {
      try {
        const { productId, userId, sellerId } = session.metadata

        // 1. CREATE ORDER RECORD
        const order = new olxOrderModel({
          buyer: userId,
          seller: sellerId,
          product: productId,
          amount: session.amount_total / 100,
          paymentId: session.payment_intent,
          status: "completed",
        })

        await order.save()
        console.log("✅ Order created:", order._id)

        // 2. DELETE PRODUCT FROM MARKETPLACE
        await olxProductModel.findByIdAndDelete(productId)
        console.log("✅ Product deleted:", productId)
      } catch (error) {
        console.error("❌ Webhook error:", error)
      }
    }
  }

  res.status(200).json({ received: true })
}

module.exports = webhookController
