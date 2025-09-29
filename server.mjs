import { validateEnvironment, getConfig } from "./config/environment.mjs";
import logger, { requestLogger } from "./utils/logger.mjs";

// Validate environment variables FIRST
validateEnvironment();
const config = getConfig();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import productRoutes from "./routes/productRoutes.mjs";
import categoryRoutes from "./routes/categoryRoutes.mjs";
import imageRoutes from "./routes/imageRoutes.mjs";
import orderRoutes from "./routes/orderRoutes.mjs";
import reviewRoutes from "./routes/reviewRoutes.mjs";
import wishlistRoutes from "./routes/wishlistRoutes.mjs";
import { errorHandler } from "./middleware/errorMiddleware.mjs";
import cartRoutes from "./routes/cartRoutes.mjs";
import paymentRoute from "./routes/paymentRoutes.mjs";
import cors from "cors";
import {
  securityHeaders,
  generalRateLimit,
  authRateLimit,
  dataSanitization,
} from "./middleware/securityMiddleware.mjs";
import {
  healthCheck,
  apiDocs,
  standardizeResponse,
} from "./utils/apiHelpers.mjs";

const app = express();
const PORT = config.port;

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware (MUST be early in middleware chain)
app.use(securityHeaders);
app.use(generalRateLimit);
app.use(dataSanitization);

// Request logging middleware
app.use(requestLogger);

// API response standardization
app.use(standardizeResponse);

// CORS configuration
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware to parse JSON with size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
connectDB();

// Health check endpoint
app.get("/health", healthCheck);

// API documentation endpoint
app.get("/docs", apiDocs);

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
      categories: "/api/categories",
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

// Routes with specific rate limiting
app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoute);
app.use("/api/images", imageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🛒 E-Dukaan Server running on http://localhost:${PORT}`);
  logger.info(`🚀 E-Commerce Backend API is ready!`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);

  console.log(`🛒 E-Dukaan Server running on http://localhost:${PORT}`);
  console.log(`🚀 E-Commerce Backend API is ready!`);
});
