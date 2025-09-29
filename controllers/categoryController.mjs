import { Category } from "../models/CategorySchema.mjs";
import { Product } from "../models/ProductSchema.mjs";
import { asyncHandler } from "../utils/errorHandler.mjs";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    showInMenu = null,
    parentOnly = false,
    includeInactive = false,
  } = req.query;

  let filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (showInMenu !== null) {
    filter.showInMenu = showInMenu === "true";
  }

  if (parentOnly) {
    filter.parentCategory = null;
  }

  const categories = await Category.find(filter)
    .populate("parentCategory", "name slug icon")
    .populate("subcategories", "name slug icon")
    .sort({ level: 1, displayOrder: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Category.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: categories.length,
    total,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
    data: categories,
  });
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res) => {
  const categoryTree = await Category.getCategoryTree();

  res.status(200).json({
    success: true,
    data: categoryTree,
  });
});

// @desc    Get menu categories
// @route   GET /api/categories/menu
// @access  Public
export const getMenuCategories = asyncHandler(async (req, res) => {
  const menuCategories = await Category.getMenuCategories();

  res.status(200).json({
    success: true,
    data: menuCategories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate("parentCategory", "name slug icon")
    .populate("subcategories", "name slug icon")
    .populate("featuredProducts", "title price image rating");

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate("parentCategory", "name slug icon")
    .populate("subcategories", "name slug icon")
    .populate("featuredProducts", "title price image rating");

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({
    category: req.params.id,
  });
  if (productsCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${productsCount} products associated with it.`,
    });
  }

  // Check if category has subcategories
  const subcategoriesCount = await Category.countDocuments({
    parentCategory: req.params.id,
  });
  if (subcategoriesCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${subcategoriesCount} subcategories.`,
    });
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

// @desc    Get products by category
// @route   GET /api/categories/:id/products
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const products = await Product.getByCategory(req.params.id, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder: sortOrder === "desc" ? -1 : 1,
    includeSubcategories: req.query.includeSubcategories === "true",
  });

  const total = await Product.countDocuments({
    category: req.params.id,
    status: "active",
  });

  res.status(200).json({
    success: true,
    category: {
      id: category._id,
      name: category.name,
      slug: category.slug,
    },
    count: products.length,
    total,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
    data: products,
  });
});
