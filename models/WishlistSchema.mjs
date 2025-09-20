import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Wishlist must belong to a user"],
      unique: true, // One wishlist per user
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better performance
// Note: user already has unique: true, so no need for separate index
wishlistSchema.index({ "products.product": 1 });
wishlistSchema.index({ "products.addedAt": -1 });

// Virtual for getting wishlist item count
wishlistSchema.virtual("itemCount").get(function () {
  return this.products.length;
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function (productId) {
  const existingProduct = this.products.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (!existingProduct) {
    this.products.push({ product: productId });
  }

  return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    (item) => item.product.toString() === productId.toString()
  );
};

// Method to clear entire wishlist
wishlistSchema.methods.clear = function () {
  this.products = [];
  return this.save();
};

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
