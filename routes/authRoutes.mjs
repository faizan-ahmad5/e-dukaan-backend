import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  testEmailConfig,
} from "../controllers/authController.mjs";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Email verification route
router.get("/verify-email/:token", verifyEmail);

// Resend verification email route
router.post("/resend-verification", resendVerificationEmail);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:token", resetPassword);

// Test email configuration route
router.get("/test-email", testEmailConfig);
router.post("/test-email", testEmailConfig);

export default router;
