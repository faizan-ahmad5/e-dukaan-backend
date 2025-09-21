import { Order } from "../models/OrderSchema.mjs";
import { Product } from "../models/ProductSchema.mjs";
import { User } from "../models/UserSchema.mjs";
import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      shippingPrice = 0,
      taxPrice = 0,
      totalPrice,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items provided",
      });
    }

    // Calculate prices and validate products
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate product ID format
      if (!item.product || !item.product.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      const product = await Product.findById(
        new mongoose.Types.ObjectId(item.product)
      );
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      // Check inventory
      if (product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for product: ${product.title}`,
        });
      }

      const orderItem = {
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        productSnapshot: {
          title: product.title,
          image: product.image,
          price: product.price,
        },
      };

      orderItems.push(orderItem);
      itemsPrice += product.price * item.quantity;

      // Update product inventory
      product.inventory.quantity -= item.quantity;
      if (product.inventory.quantity === 0) {
        product.inventory.inStock = false;
      }
      await product.save();
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice: totalPrice || itemsPrice + shippingPrice + taxPrice,
    });

    const savedOrder = await order.save();
    await savedOrder.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
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
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "totalAmount",
      "status",
    ];
    const sanitizedSort = allowedSortFields.includes(sort) ? sort : "createdAt";

    const sortOrder = order === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "title image price")
      .sort({ [sanitizedSort]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Validate user ID format
    if (!req.user.id || !req.user.id.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user session",
      });
    }

    const filter = { user: new mongoose.Types.ObjectId(req.user.id) };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("items.product", "title image price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    // Validate order ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(
      new mongoose.Types.ObjectId(req.params.id)
    )
      .populate("user", "name email")
      .populate("items.product", "title image price brand category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      new mongoose.Types.ObjectId(req.params.id)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    // Update delivery date if delivered
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Status updated by admin`,
    });

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(
      new mongoose.Types.ObjectId(req.params.id)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if order can be cancelled
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    // Restore product inventory
    for (const item of order.items) {
      const product = await Product.findById(
        new mongoose.Types.ObjectId(item.product)
      );
      if (product) {
        product.inventory.quantity += item.quantity;
        product.inventory.inStock = true;
        await product.save();
      }
    }

    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Cancelled by user",
    });

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({
      status: "processing",
    });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
        },
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};
