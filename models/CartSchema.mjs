import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user"],
      unique: true // One cart per user
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"]
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
          max: [99, "Quantity cannot exceed 99"]
        },
        addedAt: {
          type: Date,
          default: Date.now
        },
        // Store price at time of adding to cart for consistency
        priceAtAdd: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"]
        }
      }
    ],
    couponCode: {
      type: String,
      uppercase: true,
      trim: true
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"]
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount cannot be negative"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
cartSchema.index({ user: 1 });
cartSchema.index({ 'products.product': 1 });

// Virtual for getting total item count
cartSchema.virtual('itemCount').get(function() {
  return this.products.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for getting subtotal (before discounts)
cartSchema.virtual('subtotal').get(function() {
  return this.products.reduce((total, item) => total + (item.priceAtAdd * item.quantity), 0);
});

// Method to add product to cart
cartSchema.methods.addProduct = async function(productId, quantity, currentPrice) {
  const existingProductIndex = this.products.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (existingProductIndex > -1) {
    // Update quantity if product already exists
    this.products[existingProductIndex].quantity += quantity;
    if (this.products[existingProductIndex].quantity > 99) {
      this.products[existingProductIndex].quantity = 99;
    }
  } else {
    // Add new product
    this.products.push({ 
      product: productId, 
      quantity, 
      priceAtAdd: currentPrice 
    });
  }

  this.calculateTotal();
  return this.save();
};

// Method to update product quantity
cartSchema.methods.updateProductQuantity = function(productId, quantity) {
  const productIndex = this.products.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (productIndex > -1) {
    if (quantity <= 0) {
      this.products.splice(productIndex, 1);
    } else {
      this.products[productIndex].quantity = Math.min(quantity, 99);
    }
    this.calculateTotal();
  }

  return this.save();
};

// Method to remove product from cart
cartSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  this.calculateTotal();
  return this.save();
};

// Method to clear entire cart
cartSchema.methods.clear = function() {
  this.products = [];
  this.couponCode = undefined;
  this.discountAmount = 0;
  this.totalAmount = 0;
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discountAmount) {
  this.couponCode = couponCode;
  this.discountAmount = discountAmount;
  this.calculateTotal();
  return this.save();
};

// Method to calculate total amount
cartSchema.methods.calculateTotal = function() {
  const subtotal = this.subtotal;
  this.totalAmount = Math.max(0, subtotal - this.discountAmount);
};

// Pre-save middleware to calculate total
cartSchema.pre('save', function(next) {
  this.calculateTotal();
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
