const addToCartModel = require("../../models/addToCart");

const updateAddToCartProduct = async (req, res) => {
  try {
    const { addToCartProductId, quantity } = req.body;

    if (!addToCartProductId) {
      return res.status(400).json({
        message: "addToCartProductId is required",
        success: false,
        error: true
      });
    }

    const updatedProduct = await addToCartModel.updateOne(
      { _id: addToCartProductId }, // <- Correct filter
      {
        ...(quantity && { quantity: quantity }) // <- Update quantity only if defined
      }
    );

    res.json({
      message: "Product Details Updated",
      data: updatedProduct,
      error: false,
      success: true
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Update Error",
      success: false,
      error: true
    });
  }
};

module.exports = updateAddToCartProduct;
