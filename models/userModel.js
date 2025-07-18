const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
      select: false,
    },
    profilePic: { type: String, default: "" },
    resetToken: String,
    resetTokenExpiry: Date,
    isGoogleUser: { type: Boolean, default: false },
    role: { type: String, default: "user" },
    authType: { type: String, default: "email" },
  },
  { timestamps: true }
);

// ✅ Auto-hash password on save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
