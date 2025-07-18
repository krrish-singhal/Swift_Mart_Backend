// controller/user/updateProfilePic.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const userModel = require("../../models/userModel");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profiles";
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir); // Directory to store uploaded images
  },
  filename: (req, file, cb) => {
    const userId = req.user._id;
    const fileExt = path.extname(file.originalname);
    cb(null, `profile_${userId}_${Date.now()}${fileExt}`);
  },
});

// Initialize multer with limits and filters
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, or GIF files are allowed."));
    }
  },
});

// Define middleware as a direct function
const uploadProfilePic = upload.single("profilePic");

// Update profile picture handler
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture file is required",
      });
    }
    
    const userId = req.user._id;
    const filePath = `/${req.file.path.replace(/\\/g, "/")}`;
    
    const currentUser = await userModel.findById(userId);
    const oldProfilePic = currentUser.profilePic;
    
    const user = await userModel.findByIdAndUpdate(
      userId,
      { profilePic: filePath },
      { new: true }
    );
    
    // Delete old profile pic if it exists and isn't the default
    if (
      oldProfilePic &&
      oldProfilePic !== "/default-profile.png" &&
      fs.existsSync(`.${oldProfilePic}`)
    ) {
      fs.unlinkSync(`.${oldProfilePic}`);
    }
    
    return res.json({
      success: true,
      message: "Profile picture updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update profile picture error:", err);
    
    // Cleanup uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export directly as functions, not as an object with functions
module.exports.uploadProfilePic = uploadProfilePic;
module.exports.updateProfilePicture = updateProfilePicture;