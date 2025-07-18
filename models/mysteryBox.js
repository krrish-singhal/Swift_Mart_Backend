// const mongoose = require('mongoose');

// const mysteryBoxSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   boxType: {
//     type: String,
//     enum: ['Basic', 'Premium', 'Ultimate'],
//     required: true
//   },
//   claimed: {
//     type: Boolean,
//     default: false
//   },
//   claimedProductId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   },
//   orderId: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const mysteryBoxModel=mongoose.model('MysteryBox', mysteryBoxSchema);

// module.exports =  mysteryBoxModel
const mongoose = require("mongoose")

const mysteryBoxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    boxType: {
      type: String,
      enum: ["Basic", "Premium", "Ultimate"],
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    claimedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    claimedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const mysteryBoxModel=mongoose.model('MysteryBox', mysteryBoxSchema);
