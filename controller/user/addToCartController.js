const addToCartModel = require("../../models/addToCart")

const addtoCartController = async (req, res) => {
  try {
    const { productId } = req.body
    const currentUser = req.userId

    if (!currentUser) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
        error: true,
      })
    }

    // Check if product already exists in cart
    const isProductAvailable = await addToCartModel.findOne({
      productId,
      userId: currentUser,
    })

    if (isProductAvailable) {
      return res.json({
        message: "Product Already Exists in the Cart",
        success: false,
        error: true,
      })
    }

    // Add product to cart
    const payload = {
      productId: productId,
      userId: currentUser,
      quantity: 1,
    }

    const newAddToCart = new addToCartModel(payload)
    const saveProduct = await newAddToCart.save()

    // Get updated cart count
    const count = await addToCartModel.countDocuments({ userId: currentUser })

    res.json({
      data: saveProduct,
      count: count, // Include count in response
      error: false,
      success: true,
      message: "Product Added to the Cart",
    })
  } catch (err) {
    console.error("Error in addToCartController:", err)
    res.status(400).json({
      message: err.message || err,
      success: false,
      error: true,
    })
  }
}

module.exports = addtoCartController
