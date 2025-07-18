const orderModel = require("../../models/orderModel");

const orderController = async (req, res) => {
    try {
        const currentUserId = req.userId;
        
        if (!currentUserId) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
                error: true
            });
        }
        
        // Sort by createdAt in descending order (-1) to get newest first
        const orders = await orderModel.find({ userId: currentUserId }).sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for user ${currentUserId}`);
        
        res.json({
            data: orders,
            error: false,
            success: true,
            message: "Order List",
        });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(400).json({
            message: err.message || err,
            success: false,
            error: true,
        });
    }
};

module.exports = orderController;