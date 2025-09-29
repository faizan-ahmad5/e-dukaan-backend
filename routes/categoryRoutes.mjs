import express from "express";
import {
  getCategories,
  getCategoryTree,
  getMenuCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} from "../controllers/categoryController.mjs";
import { protect, isAdmin } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/tree", getCategoryTree);
router.get("/menu", getMenuCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategory);
router.get("/:id/products", getProductsByCategory);

// Protected routes (Admin only)
router.post("/", protect, isAdmin, createCategory);
router.put("/:id", protect, isAdmin, updateCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
