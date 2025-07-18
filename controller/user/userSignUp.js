const userModel = require("../../models/userModel");

const userSignUpcontroller = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        error: true,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
        error: true,
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
        error: true,
      });
    }

    
    const newUser = new userModel({
      name,
      email,
      password, // plain — schema will hash it
      profilePic: profilePic || "",
      role: "user",
      authType: "email",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: true,
    });
  }
};

module.exports = userSignUpcontroller;
