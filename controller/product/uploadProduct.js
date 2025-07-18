const productModel = require("../../models/productModel");
const userModel = require("../../models/userModel");

async function UploadProductController(req, res) {
    try {
        // Validate user authentication
        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized: Please log in",
                success: false,
                error: true,
            });
        }

        // Find user and validate
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(403).json({
                message: "Unauthorized: User not found",
                success: false,
                error: true,
            });
        }

        // Check admin role
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Permission Denied: Only Admins can upload products",
                success: false,
                error: true,
            });
        }

        // Destructure and validate product data
        const { 
            productName, 
            brandName, 
            category, 
            productImage, 
            description, 
            price, 
            sellingPrice 
        } = req.body;

        // Comprehensive field validation
        const requiredFields = [
            { field: productName, name: "Product Name" },
            { field: category, name: "Category" },
            { field: productImage, name: "Product Image" },
            { field: price, name: "Price" },
            { field: sellingPrice, name: "Selling Price" }
        ];

        // Check for empty or undefined required fields
        const missingField = requiredFields.find(item => 
            !item.field || 
            (typeof item.field === 'string' && item.field.trim() === '')
        );

        if (missingField) {
            return res.status(400).json({
                message: `Missing or invalid ${missingField.name}`,
                success: false,
                error: true,
            });
        }

        // Create and save product
        const newProduct = new productModel({
            ...req.body,
            uploadedBy: user._id
        });

        const savedProduct = await newProduct.save();

        // Successful response
        res.status(201).json({
            message: "Product Uploaded Successfully!",
            success: true,
            error: false,
            data: savedProduct,
        });

    } catch (error) {
        console.error("Upload Product Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true,
        });
    }
}

module.exports = UploadProductController;