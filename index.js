require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const router = require("./routes");
const cookieParser = require("cookie-parser");

const app = express();

// Serve static files from /uploads folder (important for profile picture & product images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Stripe Webhook handler - RAW body required here first
const webhookHandler = require("./controller/order/webhook");
app.post('/api/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// All other routes
app.use("/api", router);

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("🚀 Server is running at port", PORT);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });
