import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"]
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", 
      required: [true, "Review must be for a product"]
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Review must be linked to an order"]
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"]
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"]
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"]
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
    verified: {
      type: Boolean,
      default: false // Set to true if user actually purchased the product
    },
    helpful: {
      count: { type: Number, default: 0, min: 0 },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }]
    },
    reported: {
      count: { type: Number, default: 0, min: 0 },
      users: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        reason: {
          type: String,
          enum: ['spam', 'inappropriate', 'fake', 'other']
        },
        reportedAt: { type: Date, default: Date.now }
      }]
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'hidden'],
        message: "Status must be one of: pending, approved, rejected, hidden"
      },
      default: 'pending'
    },
    moderatorNotes: String
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Ensure one review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Other indexes for performance
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Virtual for checking if review is approved
reviewSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Method to mark review as helpful by a user
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count = this.helpful.users.length;
  }
};

// Method to remove helpful mark by a user
reviewSchema.methods.removeHelpful = function(userId) {
  this.helpful.users = this.helpful.users.filter(id => !id.equals(userId));
  this.helpful.count = this.helpful.users.length;
};

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, status: 'approved' }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].numReviews
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

// Update product rating after saving review
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.product);
});

// Update product rating after removing review
reviewSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.product);
});

export const Review = mongoose.model("Review", reviewSchema);