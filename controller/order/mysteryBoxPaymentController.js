const stripe = require("../../config/stripe");
const userModel = require("../../models/userModel");

const mysteryBoxPaymentController = async (req, res) => {
    try {
        const { boxType } = req.body;

        // Validate the box type
        if (!['Basic', 'Premium', 'Ultimate'].includes(boxType)) {
            console.error("Invalid box type:", boxType);
            return res.status(400).json({ message: "Invalid box type" });
        }

        // Get user details
        const user = await userModel.findOne({ _id: req.userId });
        if (!user) {
            console.error("User not found for userId:", req.userId);
            return res.status(404).json({ message: "User not found" });
        }

        // Define prices in paisa (1 INR = 100 paisa)
        const boxPrices = {
            Basic: 50000,     // ₹500
            Premium: 100000,  // ₹1000
            Ultimate: 200000, // ₹2000
        };

        console.log(`Creating payment session for box: ${boxType} with price: ₹${boxPrices[boxType] / 100}`);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['IN'],
            },
            customer_email: user.email,
            metadata: {
                userId: req.userId,
                mysteryBox: boxType,
            },
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `🎁 Mystery Box - ${boxType}`,
                            description: "A surprise collection of premium items!",
                        },
                        unit_amount: boxPrices[boxType], // already in paisa
                    },
                    quantity: 1,
                }
            ],
            success_url: `${process.env.FRONTEND_URL}/claim-box`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        console.log("Stripe session created successfully:", session.id);

        // If session is created successfully, send the session URL
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error creating Mystery Box session:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = mysteryBoxPaymentController;
