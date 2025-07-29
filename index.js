require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const router = require("./routes");
const cookieParser = require("cookie-parser");

const app = express();

/**
 * 1. Stripe Webhook: must be set FIRST before express.json!
 */
const webhookHandler = require("./controller/order/webhook");
app.post('/api/webhook', express.raw({ type: 'application/json' }), webhookHandler);

/**
 * 2. CORS middleware - should be immediately after webhook and BEFORE anything else
 */
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "https://swift-delta-nine.vercel.app";
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

/**
 * 3. Body Parsers & CookieParser
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/**
 * 4. Static files (profile and product images)
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * 5. API routes
 */
app.use("/api", router);

/**
 * 6. Fallback CORS handler for all other requests (404s, errors, etc).
 *    This ensures CORS headers are always set.
 */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});


const PORT = process.env.PORT || 8080;

// Connect DB and start server
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
