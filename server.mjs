import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import productRoutes from "./routes/productRoutes.mjs";
import imageRoutes from "./routes/imageRoutes.mjs";
import orderRoutes from "./routes/orderRoutes.mjs";
import reviewRoutes from "./routes/reviewRoutes.mjs";
import wishlistRoutes from "./routes/wishlistRoutes.mjs";
import { errorHandler } from "./middleware/errorMiddleware.mjs";
import cartRoutes from "./routes/cartRoutes.mjs";
import paymentRoute from "./routes/paymentRoutes.mjs";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
      "Wishlist Management",
    ],
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products",
      cart: "/api/cart",
      payment: "/api/payment",
      images: "/api/images",
      orders: "/api/orders",
      reviews: "/api/reviews",
      wishlist: "/api/wishlist",
    },
    documentation: "https://github.com/faizan-ahmad5/e-dukaan-backend#readme",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoute);
app.use("/api/images", imageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🛒 E-Dukaan Server running on http://localhost:${PORT}`);
  console.log(`🚀 E-Commerce Backend API is ready!`);
});
