const MysteryBox = require('../../models/mysteryBox');
const Product = require('../../models/productModel');
const stripe = require('../../config/stripe');

const mysteryBoxPaymentController = async (req, res) => {
  try {
    const { boxType } = req.body;
    if (!['Basic', 'Premium', 'Ultimate'].includes(boxType)) {
      return res.status(400).json({ success: false, message: "Invalid box type" });
    }

    const boxPrices = {
      Basic: 50000,     // ₹500
      Premium: 100000,  // ₹1000
      Ultimate: 200000  // ₹2000
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      metadata: {
        userId: req.userId,
        mysteryBox: boxType
      },
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Mystery Box - ${boxType}`,
            description: 'A surprise collection of premium items!'
          },
          unit_amount: boxPrices[boxType]
        },
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/mystery-box?payment_status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/mystery-box?payment_status=cancelled`
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating mystery box session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingMysteryBoxes = async (req, res) => {
  try {
    const boxes = await MysteryBox.find({
      userId: req.userId,
      claimed: false
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, pendingBoxes: boxes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const claimMysteryBox = async (req, res) => {
  try {
    const { boxId } = req.body;
    const box = await MysteryBox.findOne({
      _id: boxId,
      userId: req.userId,
      claimed: false
    });

    if (!box) {
      return res.status(404).json({ success: false, message: "Box not found or already claimed" });
    }

    // Define price ranges for different box types
    const priceRanges = {
      Basic: { min: 250, max: 700 },
      Premium: { min: 700, max: 1400 },
      Ultimate: { min: 1400, max: 999999 }
    };

    const range = priceRanges[box.boxType];
    
    // Get random product within price range
    const products = await Product.aggregate([
      { $match: { 
        sellingPrice: { $gte: range.min, $lte: range.max },
        category: { $in: ['T-Shirts', 'Caps', 'Accessories'] }
      }},
      { $sample: { size: 1 }}
    ]);

    if (!products.length) {
      return res.status(404).json({ success: false, message: "No products available" });
    }

    const product = products[0];
    
    box.claimed = true;
    box.claimedProductId = product._id;
    await box.save();

    res.status(200).json({ 
      success: true, 
      message: "Box claimed successfully",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  mysteryBoxPaymentController,
  getPendingMysteryBoxes,
  claimMysteryBox
};
