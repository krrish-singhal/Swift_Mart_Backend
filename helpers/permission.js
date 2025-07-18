const userModel = require("../models/userModel");
const mongoose = require("mongoose"); // ✅ Import Mongoose to validate ObjectId

const uploadProductPermission = async (userId) => {
    console.log("🔹 Checking Permission for userId:", userId); // ✅ Debug Log

    // ✅ Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("❌ ERROR: Invalid userId format:", userId);
        return false;
    }

    const user = await userModel.findById(userId);
    console.log("✅ User Fetched from DB:", user); // ✅ Debug Log

    if (!user) {
        console.error("❌ ERROR: No user found with ID:", userId);
        return false;
    }

    if (user.role === "admin") {
        console.log("✅ User is Admin, Permission Granted");
        return true;
    }

    console.log("❌ User is NOT an Admin, Permission Denied");
    return false;
};

module.exports = uploadProductPermission;
