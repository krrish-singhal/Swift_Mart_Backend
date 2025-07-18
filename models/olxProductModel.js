const mongoose = require("mongoose")

const olxProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
    },
    worthPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    listingPaid: {
      type: Boolean,
      default: false,
    },
    listingPaymentId: {
      type: String,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    soldAt: {
      type: Date,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
olxProductSchema.index({ status: 1, isSold: 1, createdAt: -1 })
olxProductSchema.index({ category: 1, status: 1, isSold: 1 })
olxProductSchema.index({ userId: 1 })

const olxProductModel = mongoose.model("OlxProduct", olxProductSchema)

module.exports = olxProductModel
