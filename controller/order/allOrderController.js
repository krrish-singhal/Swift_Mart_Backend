const orderModel = require("../../models/orderModel");

const allOrderController = async (req, res) => {
    try {
        // Check if user is admin (you should implement this check)
        
        // Sort by createdAt in descending order (-1) to get newest first
        const orders = await orderModel.find().sort({ createdAt: -1 });

        console.log(`Found ${orders.length} total orders`);
        
        res.json({
            data: orders,
            error: false,
            success: true,
            message: "All Orders List",
        });
    } catch (err) {
        console.error("Error fetching all orders:", err);
        res.status(400).json({
            message: err.message || err,
            success: false,
            error: true,
        });
    }
};

module.exports = allOrderController;