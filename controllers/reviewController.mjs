import { Review } from "../models/ReviewSchema.mjs";
import { Product } from "../models/ProductSchema.mjs";
import { Order } from "../models/OrderSchema.mjs";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { product, rating, title, comment, images = [] } = req.body;

    // Validate required fields
    if (!product || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product, rating, and comment are required",
      });
    }

    // Validate product ID format
    if (!product.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user has purchased this product
    const userOrder = await Order.findOne({
      user: req.user.id,
      "items.product": product,
      status: "delivered",
    });

    if (!userOrder) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: product,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = new Review({
      user: req.user.id,
      product,
      rating,
      title,
      comment,
      images,
    });

    const savedReview = await review.save();
    await savedReview.populate("user", "name avatar");

    // Update product rating
    await updateProductRating(product);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: savedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const sortOrder = order === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      product: productId,
      status: "approved",
    })
      .populate("user", "name avatar")
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({
      product: productId,
      status: "approved",
    });

    // Get rating summary
    const ratingSummary = await Review.aggregate([
      { $match: { product: productId, status: "approved" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const totalReviews = await Review.countDocuments({
      product: productId,
      status: "approved",
    });

    const averageRating = await Review.aggregate([
      { $match: { product: productId, status: "approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        summary: {
          totalReviews,
          averageRating:
            averageRating.length > 0
              ? Math.round(averageRating[0].averageRating * 10) / 10
              : 0,
          ratingSummary,
        },
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user.id })
      .populate("product", "title image price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user reviews",
      error: error.message,
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update fields if provided
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    // Reset moderation status if content changed
    review.status = "pending";
    review.updatedAt = new Date();

    const updatedReview = await review.save();
    await updatedReview.populate("user", "name avatar");

    // Update product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating
    await updateProductRating(productId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// Get all reviews (Admin only)
export const getAllReviews = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    // Whitelist allowed sort fields to prevent injection
    const allowedSortFields = ["createdAt", "rating", "updatedAt"];
    const sanitizedSort = allowedSortFields.includes(sort) ? sort : "createdAt";

    const sortOrder = order === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .populate("user", "name email avatar")
      .populate("product", "title image")
      .sort({ [sanitizedSort]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// Moderate review (Admin only)
export const moderateReview = async (req, res) => {
  try {
    const { status, moderatorNote } = req.body;
    const validStatuses = ["pending", "approved", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status;
    if (moderatorNote) {
      review.moderatorNote = moderatorNote;
    }

    await review.save();

    // Update product rating if approved/rejected
    if (status === "approved" || status === "rejected") {
      await updateProductRating(review.product);
    }

    res.json({
      success: true,
      message: "Review moderated successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to moderate review",
      error: error.message,
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user already marked this review as helpful
    if (review.helpful.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You have already marked this review as helpful",
      });
    }

    review.helpful.push(req.user.id);
    await review.save();

    res.json({
      success: true,
      message: "Review marked as helpful",
      data: {
        helpfulCount: review.helpful.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark review as helpful",
      error: error.message,
    });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const ratingStats = await Review.aggregate([
      { $match: { product: productId, status: "approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const product = await Product.findById(productId);
    if (product && ratingStats.length > 0) {
      product.rating.average =
        Math.round(ratingStats[0].averageRating * 10) / 10;
      product.rating.count = ratingStats[0].totalRatings;
      await product.save();
    } else if (product) {
      product.rating.average = 0;
      product.rating.count = 0;
      await product.save();
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};
