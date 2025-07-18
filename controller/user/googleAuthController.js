const { OAuth2Client } = require('google-auth-library');
const jwt = require("jsonwebtoken");
const userModel = require("../../models/userModel");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthController = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required", success: false, error: true });
    }

    // Verify token using Google Auth library
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Invalid Google token: Email missing", success: false, error: true });
    }

    // Check if user exists
    let user = await userModel.findOne({ email });

    if (user) {
      // Update picture if missing
      if (!user.profilePic && picture) {
        user.profilePic = picture;
        await user.save();
      }
    } else {
      // Create new user
      const defaultProfilePic = picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      user = new userModel({
        name,
        email,
        profilePic: defaultProfilePic,
        isGoogleUser: true,
      });
      await user.save();
    }

    // Generate token
    const tokenData = { id: user._id, email: user.email, role: user.role };
    const authToken = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || "",
        role: user.role,
      },
      token: authToken,
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = googleAuthController;
