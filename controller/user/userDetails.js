const userModel = require("../../models/userModel");

async function userDetailsController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized - No User ID Found",
                success: false,
                error: true
            });
        }

        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: true
            });
        }

        res.status(200).json({
            data: user,
            error: false,
            success: true,
            message: "User Details"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

module.exports = userDetailsController;
