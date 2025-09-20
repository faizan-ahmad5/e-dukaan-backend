import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import productRoutes from "./routes/productRoutes.mjs";
import { errorHandler } from "./middleware/errorMiddleware.mjs";
import cartRoutes from "./routes/cartRoutes.mjs";
import paymentRoute from "./routes/paymentRoutes.mjs";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
connectDB();

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "🛒 Welcome to E-Dukaan API",
    description: "Your Complete E-Commerce Backend Solution",
    version: "1.0.0",
    features: [
      "JWT Authentication",
      "Product Management", 
      "Shopping Cart",
      "Order Processing",
      "Payment Integration",
      "Reviews & Ratings",
      "Wishlist Management"
    ],
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products", 
      cart: "/api/cart",
      payment: "/api/payment"
    },
    documentation: "https://github.com/faizan-ahmad5/jwt-auth-atlas-crud#readme"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoute);
// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🛒 E-Dukaan Server running on http://localhost:${PORT}`);
  console.log(`🚀 E-Commerce Backend API is ready!`);
});
