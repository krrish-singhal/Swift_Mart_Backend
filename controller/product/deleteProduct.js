const productModel = require("../../models/productModel");
const uploadProductPermission = require("../../helpers/permission");

async function deleteProductController(req, res) {
    try {
        // Check permission
        if (!uploadProductPermission(req.user)) {
            return res.status(403).json({
                message: "Permission denied!",
                success: false,
                error: true,
            });
        }

        // Validate product ID
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true,
            });
        }

        // Delete product
        const deletedProduct = await productModel.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true,
            });
        }

        return res.json({
            message: "Product deleted successfully",
            data: deletedProduct,
            success: true,
            error: false,
        });

    } catch (err) {
        console.error("❌ Error deleting product:", err);
        return res.status(500).json({
            message: err.message || "Internal Server Error",
            success: false,
            error: true,
        });
    }
}

module.exports = deleteProductController;
