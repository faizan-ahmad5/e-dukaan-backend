import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductImages,
  addProductImage,
  removeProductImage,
} from "../controllers/productController.mjs";
import { isAdmin, protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// CREATE product
router.post("/", protect, isAdmin, createProduct);

// GET all products
router.get("/", getProducts);

// GET single product by ID
router.get("/:id", getProductById);

// UPDATE product by ID
router.put("/:id", protect, updateProduct);

// DELETE product by ID
router.delete("/:id", protect, deleteProduct);

// Image management routes
router.put("/:id/images", protect, isAdmin, updateProductImages);
router.post("/:id/images", protect, isAdmin, addProductImage);
router.delete("/:id/images/:imageUrl", protect, isAdmin, removeProductImage);

export default router;
