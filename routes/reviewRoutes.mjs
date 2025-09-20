import express from "express";
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  moderateReview,
  markReviewHelpful,
} from "../controllers/reviewController.mjs";
import { protect, isAdmin } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Create new review (Protected)
router.post("/", protect, createReview);

// Get user's reviews (Protected)
router.get("/my-reviews", protect, getUserReviews);

// Get all reviews (Admin only)
router.get("/", protect, isAdmin, getAllReviews);

// Get reviews for a specific product (Public)
router.get("/product/:productId", getProductReviews);

// Update review (Protected - user can only update their own reviews)
router.put("/:id", protect, updateReview);

// Delete review (Protected - user can delete their own, admin can delete any)
router.delete("/:id", protect, deleteReview);

// Moderate review (Admin only)
router.put("/:id/moderate", protect, isAdmin, moderateReview);

// Mark review as helpful (Protected)
router.post("/:id/helpful", protect, markReviewHelpful);

export default router;
