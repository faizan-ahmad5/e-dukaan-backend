import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
export const payment = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.products.map((product) => {
        return {
          price_data: {
            currency: "USD",
            product_data: {
              name: product.name,
            },
            unit_amount: product.unit_amount * 100,
          },
          quantity: product.quantity,
        };
      }),
      mode: "payment",
      success_url:
        process.env.FRONTEND_SUCCESS_URL || "http://localhost:5173/success",
      cancel_url:
        process.env.FRONTEND_CANCEL_URL || "http://localhost:5173/cancel",
    });
    res.json({
      success: true,
      session,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
