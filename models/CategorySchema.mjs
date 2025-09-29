import mongoose from "mongoose";

// Define the category schema for dynamic categories
const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: [60, "Category slug cannot exceed 60 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: "Please provide a valid image URL",
      },
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, "Icon name cannot exceed 50 characters"],
      default: "📦", // Default emoji icon
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: [0, "Level cannot be negative"],
      max: [5, "Maximum category depth is 5 levels"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    showInMenu: {
      type: Boolean,
      default: true,
    },
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    metaKeywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Virtual to get products count in this category
categorySchema.virtual("productsCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Virtual to check if category has subcategories
categorySchema.virtual("hasSubcategories").get(function () {
  return this.subcategories && this.subcategories.length > 0;
});

// Index for better search performance
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ parentCategory: 1, displayOrder: 1 });
categorySchema.index({ isActive: 1, showInMenu: 1 });

// Pre-save middleware to generate slug if not provided
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }
  next();
});

// Pre-save middleware to set level based on parent category
categorySchema.pre("save", async function (next) {
  if (this.parentCategory) {
    try {
      const parentCategory = await mongoose
        .model("Category")
        .findById(this.parentCategory);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
      }
    } catch (error) {
      return next(error);
    }
  } else {
    this.level = 0;
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function () {
  try {
    const categories = await this.find({ isActive: true })
      .sort({ level: 1, displayOrder: 1 })
      .populate("subcategories")
      .lean();

    // Build tree structure
    const categoryMap = {};
    const tree = [];

    // First pass: create map of all categories
    categories.forEach((category) => {
      categoryMap[category._id] = { ...category, children: [] };
    });

    // Second pass: build tree structure
    categories.forEach((category) => {
      if (category.parentCategory) {
        const parent = categoryMap[category.parentCategory];
        if (parent) {
          parent.children.push(categoryMap[category._id]);
        }
      } else {
        tree.push(categoryMap[category._id]);
      }
    });

    return tree;
  } catch (error) {
    throw error;
  }
};

// Static method to get menu categories
categorySchema.statics.getMenuCategories = async function () {
  return await this.find({
    isActive: true,
    showInMenu: true,
    level: { $lte: 2 }, // Only show up to 2 levels in menu
  })
    .sort({ level: 1, displayOrder: 1 })
    .populate("subcategories", "name slug icon")
    .lean();
};

export const Category = mongoose.model("Category", categorySchema);
