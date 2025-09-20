import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"],
        },
        // Store product details at time of order for historical accuracy
        productSnapshot: {
          title: String,
          image: String,
          sku: String,
        },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: {
          values: ["stripe", "paypal", "cash-on-delivery"],
          message:
            "Payment method must be one of: stripe, paypal, cash-on-delivery",
        },
        required: true,
      },
      transactionId: String,
      paidAt: Date,
      status: {
        type: String,
        enum: {
          values: [
            "pending",
            "paid",
            "failed",
            "refunded",
            "partially-refunded",
          ],
          message:
            "Payment status must be one of: pending, paid, failed, refunded, partially-refunded",
        },
        default: "pending",
      },
    },
    pricing: {
      itemsPrice: {
        type: Number,
        required: true,
        min: [0, "Items price cannot be negative"],
      },
      shippingPrice: {
        type: Number,
        default: 0,
        min: [0, "Shipping price cannot be negative"],
      },
      taxPrice: {
        type: Number,
        default: 0,
        min: [0, "Tax price cannot be negative"],
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: [0, "Discount amount cannot be negative"],
      },
      totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price cannot be negative"],
      },
    },
    orderStatus: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "returned",
        ],
        message: "Order status must be valid",
      },
      default: "pending",
    },
    shippingInfo: {
      carrier: String,
      trackingNumber: String,
      shippedAt: Date,
      deliveredAt: Date,
      estimatedDelivery: Date,
    },
    notes: {
      customerNotes: String,
      adminNotes: String,
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    // Order timeline for tracking status changes
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate unique order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Find the last order number for today
    const lastOrder = await this.constructor
      .findOne({
        orderNumber: new RegExp(`^ORD-${year}${month}${day}`),
      })
      .sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split("-").pop());
      sequence = lastSequence + 1;
    }

    this.orderNumber = `ORD-${year}${month}${day}-${String(sequence).padStart(
      4,
      "0"
    )}`;
  }
  next();
});

// Add status change to history
orderSchema.pre("save", function (next) {
  if (this.isModified("orderStatus")) {
    this.statusHistory.push({
      status: this.orderStatus,
      updatedAt: new Date(),
    });
  }
  next();
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
// Note: orderNumber already has unique: true, so no need for separate index
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "paymentInfo.status": 1 });
orderSchema.index({ totalAmount: -1 });

// Virtual for checking if order is paid
orderSchema.virtual("isPaid").get(function () {
  return this.paymentInfo.status === "paid";
});

// Virtual for checking if order is delivered
orderSchema.virtual("isDelivered").get(function () {
  return this.orderStatus === "delivered";
});

export const Order = mongoose.model("Order", orderSchema);
