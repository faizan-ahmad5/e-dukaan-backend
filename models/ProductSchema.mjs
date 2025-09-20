import mongoose from "mongoose";

// Define the enhanced product schema for e-commerce
const productSchema = mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: { 
      type: String, 
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    image: { 
      type: String, 
      required: [true, "Product image is required"],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: "Please provide a valid image URL"
      }
    },
    images: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: "Please provide valid image URLs"
      }
    }],
    price: { 
      type: Number, 
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
      validate: {
        validator: function(v) {
          return !v || v >= this.price;
        },
        message: "Compare price should be greater than or equal to price"
      }
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'automotive', 'other'],
        message: "Category must be one of the predefined options"
      }
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"]
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"]
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'discontinued', 'out-of-stock'],
        message: "Status must be one of: active, inactive, discontinued, out-of-stock"
      },
      default: 'active'
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"]
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 }
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO title cannot exceed 60 characters"]
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for checking if stock is low
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

// Index for better search performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
