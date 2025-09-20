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
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from "../middleware/validation.mjs";

const router = express.Router();

// Register route
router.post("/register", validateRegister, registerUser);

// Login route
router.post("/login", validateLogin, loginUser);

// Email verification route
router.get("/verify-email/:token", verifyEmail);

// Resend verification email route
router.post(
  "/resend-verification",
  validateForgotPassword,
  resendVerificationEmail
);

// Forgot password route
router.post("/forgot-password", validateForgotPassword, forgotPassword);

// Reset password route
router.post("/reset-password/:token", validateResetPassword, resetPassword);

// Test email configuration route
router.get("/test-email", testEmailConfig);
router.post("/test-email", testEmailConfig);

export default router;
