const productModel = require("../../models/productModel");
const uploadProductPermission = require("../../helpers/permission");

async function updateProductController(req, res) {
    try {
        // ✅ Ensure user has permission
        if (!uploadProductPermission(req.user)) {
            return res.status(403).json({
                message: "Permission denied!",
                success: false,
                error: true,
            });
        }

        const { _id, ...updatedData } = req.body;

        // ✅ Validate _id
        if (!_id) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true,
            });
        }

        // ✅ Update product and return new data
        const updateProduct = await productModel.findByIdAndUpdate(_id, updatedData, { new: true });

        if (!updateProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true,
            });
        }

        return res.json({
            message: "Product Updated Successfully",
            data: updateProduct,  // ✅ Return updated product
            success: true,
            error: false,
        });

    } catch (err) {
        console.error("❌ Error updating product:", err);
        return res.status(500).json({
            message: err.message || "Internal Server Error",
            success: false,
            error: true,
        });
    }
}

module.exports = updateProductController;
