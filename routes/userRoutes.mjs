import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserAvatar,
  getProfile,
  updateProfile,
} from "../controllers/userController.mjs";
import { protect, isAdmin } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// User profile routes (must come before parametric routes)
router.get("/profile/me", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Protected route to get all users (Only accessible by admin)
router.get("/", protect, isAdmin, getUsers);

// Protected route to get a user by ID (Only accessible by admin)
router.get("/:id", protect, isAdmin, getUserById);

// Protected route to update a user by ID (Only accessible by admin)
router.put("/:id", protect, isAdmin, updateUser);

// Protected route to delete a user by ID (Only accessible by admin)
router.delete("/:id", protect, isAdmin, deleteUser);

router.put("/:id/avatar", protect, updateUserAvatar);

export default router;
