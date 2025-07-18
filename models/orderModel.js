const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
  {
    productDetails: [
      {
        productId: { type: String, required: true },
        name: String,
        price: Number,
        quantity: Number,
        image: [String],
      },
    ],
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    paymentDetails: {
      paymentId: String,
      payment_method_type: [String],
      payment_status: String,
    },
    shipping_options: [
      {
        shipping_amount: Number,
        shippingAddress: {
          line1: String,
          line2: String,
          city: String,
          state: String,
          postal_code: String,
          country: String,
        },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true },
)

const orderModel = mongoose.model("Order", orderSchema)

module.exports = orderModel
