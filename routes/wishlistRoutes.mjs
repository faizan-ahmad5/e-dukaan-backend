import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  getWishlistStats,
  isInWishlist,
  checkMultipleProducts,
} from "../controllers/wishlistController.mjs";
import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get("/", getWishlist);

// Add item to wishlist (both routes for compatibility)
router.post("/", addToWishlist);
router.post("/add", addToWishlist);

// Remove item from wishlist
router.delete("/remove/:productId", removeFromWishlist);

// Clear entire wishlist
router.delete("/clear", clearWishlist);

// Move item from wishlist to cart
router.post("/move-to-cart", moveToCart);

// Get wishlist statistics
router.get("/stats", getWishlistStats);

// Check if single product is in wishlist
router.get("/check/:productId", isInWishlist);

// Check multiple products in wishlist
router.post("/check-multiple", checkMultipleProducts);

export default router;
