import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/UserSchema.mjs";
import emailService from "../utils/emailService.mjs";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Test email configuration
export const testEmailConfig = async (req, res) => {
  try {
    console.log("🧪 Testing email configuration...");

    // Test email service connection
    const connectionTest = await emailService.testConnection();

    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: "Email configuration test failed",
        error: connectionTest.error,
        troubleshooting: {
          gmail:
            "Make sure you're using an App Password, not your regular Gmail password",
          outlook:
            "Check if 2FA is enabled and you're using the correct password",
          general:
            "Verify EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS in your .env file",
        },
      });
    }

    // Send test email if requested
    if (req.body.sendTestEmail && req.body.testEmail) {
      console.log(`📧 Sending test email to ${req.body.testEmail}...`);

      const testUser = {
        name: "Test User",
        email: req.body.testEmail,
      };

      const emailResult = await emailService.sendVerificationEmail(
        testUser,
        "test-token-12345"
      );

      return res.json({
        success: true,
        message: "Email configuration test successful!",
        data: {
          connectionTest: "✅ SMTP connection successful",
          testEmail: emailResult.success
            ? "✅ Test email sent successfully"
            : "❌ Test email failed",
          emailError: emailResult.error || null,
        },
      });
    }

    res.json({
      success: true,
      message: "Email configuration test successful!",
      data: {
        connectionTest: "✅ SMTP connection successful",
        note: "Send POST request with { 'sendTestEmail': true, 'testEmail': 'your@email.com' } to send test email",
      },
    });
  } catch (error) {
    console.error("❌ Email configuration test failed:", error);
    res.status(500).json({
      success: false,
      message: "Email configuration test failed",
      error: error.message,
      troubleshooting: {
        common_issues: [
          "Check if .env file exists and has correct EMAIL_* variables",
          "For Gmail: Use App Password (16 characters with spaces)",
          "For Outlook: Enable 2FA if using App Password",
          "Check if EMAIL_HOST and EMAIL_PORT are correct",
          "Verify EMAIL_USER is a valid email address",
        ],
      },
    });
  }
};

// User registration
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user (not verified initially)
    const user = new User({
      name,
      email,
      password,
      isVerified: false,
    });

    // Generate verification token
    const verificationToken = emailService.generateVerificationToken();
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      user,
      verificationToken
    );

    if (!emailResult.success) {
      // If email fails, we still create the user but inform about email issue
      console.error("Failed to send verification email:", emailResult.error);
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        emailSent: emailResult.success,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address before logging in",
        needsVerification: true,
        userId: user._id,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Hash the token to compare with stored version
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Verify the user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    res.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      user,
      verificationToken
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
      error: error.message,
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with that email",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email address first",
      });
    }

    // Generate reset token
    const { token, hashedToken } = emailService.generateResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(user, token);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token to compare with stored version
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Reset password
    user.password = password; // Will be hashed by pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};
