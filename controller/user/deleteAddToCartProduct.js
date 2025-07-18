const addToCartModel = require("../../models/addToCart")

const deleteAddToCartProduct = async (req, res) => {
  try {
    const { productId } = req.body; // productId is actually the cart entry's _id
    const currentUser = req.userId;

    if (!currentUser) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
        error: true,
      });
    }

    // Delete product from cart using _id
    const result = await addToCartModel.findOneAndDelete({
      _id: productId, // <-- Use _id here
      userId: currentUser,
    });

    if (!result) {
      return res.status(404).json({
        message: "Product not found in cart",
        success: false,
        error: true,
      });
    }

    // Get updated cart count
    const count = await addToCartModel.countDocuments({ userId: currentUser });

    res.json({
      message: "Product removed from cart",
      count: count,
      success: true,
      error: false,
    });
  } catch (err) {
    console.error("Error in deleteAddToCartProduct:", err);
    res.status(400).json({
      message: err.message || err,
      success: false,
      error: true,
    });
  }
};


module.exports = deleteAddToCartProduct
