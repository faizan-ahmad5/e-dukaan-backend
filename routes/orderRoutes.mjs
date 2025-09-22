import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from "../controllers/orderController.mjs";
import { protect, isAdmin } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Create new order (Protected)
router.post("/", protect, createOrder);

// Get user's orders (Protected) or all orders (Admin only)
router.get("/", protect, (req, res, next) => {
  if (req.user.isAdmin) {
    // Admin can see all orders
    getAllOrders(req, res);
  } else {
    // Regular users see only their orders
    getUserOrders(req, res);
  }
});

// Get user's orders (Protected) - alternative endpoint
router.get("/my-orders", protect, getUserOrders);

// Get order statistics (Admin only)
router.get("/stats", protect, isAdmin, getOrderStats);

// Get single order by ID (Protected - user can only see their own orders)
router.get("/:id", protect, getOrderById);

// Update order status (Admin only)
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

// Cancel order (Protected - users can cancel their own orders)
router.put("/:id/cancel", protect, cancelOrder);

export default router;
