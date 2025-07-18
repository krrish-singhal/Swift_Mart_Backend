const addToCartModel = require("../../models/addToCart");

async function countAddToCartProduct(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
                error: true
            });
        }

        const count = await addToCartModel.countDocuments({ userId: userId });
        console.log(`Cart count for user ${userId}: ${count}`);

        res.json({
            message: "Cart count retrieved successfully",
            data: { count: count },
            success: true,
            error: false
        });
    } catch (err) {
        console.error("Error counting cart items:", err);
        res.status(400).json({
            message: err.message || err,
            success: false,
            error: true
        });
    }
}

module.exports = countAddToCartProduct;