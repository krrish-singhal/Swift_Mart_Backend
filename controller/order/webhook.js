const stripe = require("../../config/stripe");
const addToCartModel = require("../../models/addToCart");
const orderModel = require("../../models/orderModel");
const MysteryBox = require("../../models/mysteryBox");
const mongoose = require("mongoose");

const endpointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

async function getLineItems(lineItems) {
  const ProductItems = [];
  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      try {
        const product = await stripe.products.retrieve(item.price.product);
        ProductItems.push({
          productId: product.metadata?.productId || null,
          name: product.name || "Unknown Product",
          price: (item.price.unit_amount / 100) || 0,
          quantity: item.quantity || 1,
          image: Array.isArray(product.images) ? product.images : [],
        });
        console.log("✅ Added product to order:", {
          name: product.name,
          price: item.price.unit_amount / 100,
          quantity: item.quantity,
        });
      } catch (err) {
        console.error("❌ Error retrieving product:", err.message);
        ProductItems.push({
          productId: null,
          name: "Product information unavailable",
          price: (item.price?.unit_amount / 100) || 0,
          quantity: item.quantity || 1,
          image: [],
        });
      }
    }
  }
  return ProductItems;
}

const webhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      console.log("🔔 Stripe checkout.session.completed triggered");
      console.log("Session data:", {
        id: session.id,
        customer_email: session.customer_email,
        userId: session.metadata?.userId,
      });

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const productDetails = await getLineItems(lineItems);

      const shippingAmount = session.total_details?.amount_shipping
        ? session.total_details.amount_shipping / 100
        : 0;

      const orderDetails = {
        productDetails,
        email: session.customer_email,
        userId: session.metadata?.userId,
        paymentDetails: {
          paymentId: session.payment_intent,
          payment_method_type: session.payment_method_types,
          payment_status: session.payment_status,
        },
        shipping_options: [
          {
            shipping_amount: shippingAmount,
            shippingAddress: session.shipping_details?.address || {},
          },
        ],
        totalAmount: session.amount_total / 100,
      };

      // Save Mystery Box if exists
      if (session.metadata?.mysteryBox) {
        await new MysteryBox({
          userId: session.metadata.userId,
          boxType: session.metadata.mysteryBox,
          orderId: session.id,
        }).save();
        console.log("🎁 Mystery box saved");
      }

      // Save Order
      const savedOrder = await new orderModel(orderDetails).save();
      console.log(`✅ Order saved with ID: ${savedOrder._id}`);

      // Handle Cart Deletion
      const userId = session.metadata?.userId;
      
      if (userId) {
        try {
          // Use valid ObjectId when calling deleteMany
          const userObjectId = new mongoose.Types.ObjectId(userId);
          const deleteResult = await addToCartModel.deleteMany({ userId: userObjectId });
          
          console.log(`🗑️ Deleted ${deleteResult.deletedCount} cart items for user ${userId}`);
        } catch (error) {
          console.error("❌ Error deleting cart items:", error.message);
        }
      } else {
        console.warn("⚠️ No userId found in metadata, cart not cleared");
      }

    } catch (error) {
      console.error("❌ Webhook processing error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.status(200).json({ success: true, message: "Webhook processed" });
};

module.exports = webhooks;