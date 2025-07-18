const express = require("express")
const multer = require("multer")
const upload = multer({ dest: "uploads/" })
const router = express.Router()

const userSignUpcontroller = require("../controller/user/userSignUp")
const userSignInController = require("../controller/user/userSignIn")
const userDetailsController = require("../controller/user/userDetails")
const authToken = require("../middleware/authToken")
const userLogout = require("../controller/user/userLogout")
const allUsers = require("../controller/user/allUsers")
const updateUserDetails = require("../controller/user/updateUser")
const UploadProductController = require("../controller/product/uploadProduct")
const getProductController = require("../controller/product/getProduct")
const updateProductController = require("../controller/product/updateProduct")
const getProductByCategory = require("../controller/product/getCategoryProductOne")
const getCategoryWiseProduct = require("../controller/product/getCategoryWiseProduct")
const getProductDetails = require("../controller/product/getProductDetails")
const addtoCartController = require("../controller/user/addToCartController")
const countAddToCartProduct = require("../controller/user/countAddToCartProduct")
const addToCartViewProduct = require("../controller/user/addToCartViewProduct")
const updateAddToCartProduct = require("../controller/user/updateAddToCartProduct")
const deleteAddToCartProduct = require("../controller/user/deleteAddToCartproduct")
const searchProduct = require("../controller/product/searchProduct")
const filterProductController = require("../controller/product/filterProduct")
const paymentController = require("../controller/order/paymentController")
const webhooks = require("../controller/order/webhook")
const orderController = require("../controller/order/orderController")
const allOrderController = require("../controller/order/allOrderController")
const deleteProductController = require("../controller/product/deleteProduct")

const {
  mysteryBoxPaymentController,
  getPendingMysteryBoxes,
  claimMysteryBox,
} = require("../controller/product/mysteryBoxController")
const listingPaymentController = require("../controller/olx/listingPaymentController")
const  purchaseController= require("../controller/olx/purchaseController")
const myPurchasesController =require("../controller/olx/myPurchasesController")
const createProductController = require("../controller/olx/createProductController")
const productsController = require("../controller/olx/productsController")
const productDetailController = require("../controller/olx/productDetailController")
const webhookController = require("../controller/olx/olxWebhook")
const adminProductsController = require("../controller/olx/adminProductsController")
const updateProductStatusController = require("../controller/olx/updateProductStatusController")

// New controllers for forgot password and Google auth
const forgotPasswordController = require("../controller/user/forgotPasswordController")
const verifyResetTokenController = require("../controller/user/verifyResetTokenController")
const resetPasswordController = require("../controller/user/resetPasswordController")
const googleAuthController = require("../controller/user/googleAuthController")
const { uploadProfilePic, updateProfilePicture } = require("../controller/user/updateProfilePic")
const myProductsController = require("../controller/olx/myProductsController")
const adminProductCountsController = require("../controller/olx/adminProductCountsController")

// Users
router.post("/signup", userSignUpcontroller)
router.post("/signin", userSignInController)
router.get("/user-details", authToken, userDetailsController)
router.get("/userLogout", userLogout)

// Password Reset Routes
router.post("/forgot-password", forgotPasswordController)
router.get("/verify-reset-token/:token", verifyResetTokenController)
router.post("/reset-password", resetPasswordController)

// Google Authentication
router.post("/google-auth", googleAuthController)

// Admin Panel
router.get("/all-users", allUsers)
router.post("/update-user",authToken, updateUserDetails)
router.delete("/delete-product/:id", authToken, deleteProductController)


// Products
router.post("/upload-product", authToken, UploadProductController)
router.get("/get-product", getProductController)
router.post("/update-product", authToken, updateProductController)
router.get("/get-categoryProduct", getProductByCategory)
router.post("/category-product", getCategoryWiseProduct)
router.post("/product-details", getProductDetails)
router.get("/search", searchProduct)
router.post("/filter-product", filterProductController)

// Add to cart
router.post("/addtocart", authToken, addtoCartController)
router.get("/countAddToCartProuct", authToken, countAddToCartProduct)
router.get("/view-card-product", authToken, addToCartViewProduct)
router.post("/update-cart-product", authToken, updateAddToCartProduct)
router.post("/delete-cart-product", authToken, deleteAddToCartProduct)

// payment and order
router.post("/checkout", authToken, paymentController)
router.post("/webhook", webhooks)
router.get("/order-list", authToken, orderController)
router.get("/all-orders", authToken, allOrderController)

// extra features
router.post("/mystery-box-payment", authToken, mysteryBoxPaymentController)
router.get("/pending-mystery-boxes", authToken, getPendingMysteryBoxes)
router.post("/claim-mystery-box", authToken, claimMysteryBox)

// Profile picture update
router.put("/update-profile-picture", authToken, uploadProfilePic, updateProfilePicture)

// OLX feature
router.get("/olx/products", productsController)
router.get("/olx/product/:productId", productDetailController)

// Stripe webhook (no auth) - Use raw body parser for Stripe webhooks
router.post(
  "/olx/webhook",
  express.raw({ type: "application/json" }),
  webhookController
)

// Protected OLX routes
router.post("/olx/create-product", authToken, upload.array("images", 5), createProductController)
router.post("/olx/listing-payment", authToken, listingPaymentController)
router.post("/olx/purchase", authToken, purchaseController)
router.get("/olx/my-purchases", authToken, myPurchasesController)
router.get("/olx/my-products", authToken, myProductsController);

// Admin OLX routes
router.get("/olx/admin-products", authToken, adminProductsController)
router.post("/olx/update-product-status", authToken, updateProductStatusController)
router.get("/olx/admin-product-counts", authToken, adminProductCountsController);

module.exports = router