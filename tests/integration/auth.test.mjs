import request from "supertest";
import express from "express";
import cors from "cors";
import authRoutes from "../../routes/authRoutes.mjs";
import { User } from "../../models/UserSchema.mjs";
import emailService from "../../utils/emailService.mjs";

// Create express app for testing
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

// Mock error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

describe("Auth Routes - Integration Tests", () => {
  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining("Registration successful"),
        data: {
          name: userData.name,
          email: userData.email,
          isVerified: false,
          emailSent: true,
        },
      });

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.isVerified).toBe(false);

      // Verify email service was called
      expect(emailService.default.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: userData.email }),
        expect.any(String)
      );
    });

    it("should return validation error for invalid email", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.stringContaining("email"),
          }),
        ]),
      });
    });

    it("should return validation error for short password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "123", // Too short
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: expect.stringContaining("6 characters"),
          }),
        ]),
      });
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      // Create user first time
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to create same user again
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "User with this email already exists",
      });
    });

    it("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({}) // Empty body
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "name" }),
          expect.objectContaining({ field: "email" }),
          expect.objectContaining({ field: "password" }),
        ]),
      });
    });
  });

  describe("POST /api/auth/login", () => {
    let testUser;

    beforeEach(async () => {
      // Create a verified user for testing
      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        isVerified: true,
      });
      await testUser.save();
    });

    it("should login user with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Login successful",
        data: {
          _id: expect.any(String),
          name: testUser.name,
          email: testUser.email,
          isAdmin: false,
          isVerified: true,
          token: expect.any(String),
        },
      });

      // Verify token format
      expect(response.body.data.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it("should return error for invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return error for invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return error for unverified user", async () => {
      // Create unverified user
      const unverifiedUser = new User({
        name: "Unverified User",
        email: "unverified@example.com",
        password: "password123",
        isVerified: false,
      });
      await unverifiedUser.save();

      const loginData = {
        email: "unverified@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: "Please verify your email address before logging in",
        needsVerification: true,
        userId: unverifiedUser._id.toString(),
      });
    });

    it("should return validation error for invalid email format", async () => {
      const loginData = {
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
      });
    });

    it("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
          expect.objectContaining({ field: "password" }),
        ]),
      });
    });
  });

  describe("GET /api/auth/verify-email/:token", () => {
    let testUser, verificationToken;

    beforeEach(async () => {
      verificationToken = "test-verification-token";
      const hashedToken = require("crypto")
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        isVerified: false,
        verificationToken: hashedToken,
        verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
      });
      await testUser.save();
    });

    it("should verify email with valid token", async () => {
      const response = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Email verified successfully! You can now log in.",
        data: {
          _id: testUser._id.toString(),
          name: testUser.name,
          email: testUser.email,
          isVerified: true,
        },
      });

      // Verify user is updated in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.verificationToken).toBeUndefined();
      expect(updatedUser.verificationTokenExpire).toBeUndefined();

      // Verify welcome email was sent
      expect(emailService.default.sendWelcomeEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: testUser.email })
      );
    });

    it("should return error for invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/verify-email/invalid-token")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid or expired verification token",
      });
    });

    it("should return error for expired token", async () => {
      // Update user with expired token
      await User.findByIdAndUpdate(testUser._id, {
        verificationTokenExpire: Date.now() - 1000, // Expired 1 second ago
      });

      const response = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid or expired verification token",
      });
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        isVerified: true,
      });
      await testUser.save();
    });

    it("should send password reset email for valid user", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Password reset email sent successfully",
      });

      // Verify user has reset token
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.resetPasswordToken).toBeTruthy();
      expect(updatedUser.resetPasswordExpire).toBeTruthy();

      // Verify email service was called
      expect(emailService.default.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: testUser.email }),
        expect.any(String)
      );
    });

    it("should return error for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: "User not found with that email",
      });
    });

    it("should return error for unverified user", async () => {
      await User.findByIdAndUpdate(testUser._id, { isVerified: false });

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Please verify your email address first",
      });
    });

    it("should return validation error for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "invalid-email" })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
      });
    });
  });

  describe("POST /api/auth/reset-password/:token", () => {
    let testUser, resetToken;

    beforeEach(async () => {
      resetToken = "test-reset-token";
      const hashedToken = require("crypto")
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword123",
        isVerified: true,
        resetPasswordToken: hashedToken,
        resetPasswordExpire: Date.now() + 10 * 60 * 1000,
      });
      await testUser.save();
    });

    it("should reset password with valid token", async () => {
      const newPassword = "newpassword123";

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: newPassword })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining("Password reset successfully"),
      });

      // Verify user password was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpire).toBeUndefined();

      // Verify new password works
      const isValidPassword = await updatedUser.matchPassword(newPassword);
      expect(isValidPassword).toBe(true);

      // Verify old password doesn't work
      const isOldPasswordValid = await updatedUser.matchPassword(
        "oldpassword123"
      );
      expect(isOldPasswordValid).toBe(false);
    });

    it("should return error for invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password/invalid-token")
        .send({ password: "newpassword123" })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid or expired reset token",
      });
    });

    it("should return error for expired token", async () => {
      // Update user with expired token
      await User.findByIdAndUpdate(testUser._id, {
        resetPasswordExpire: Date.now() - 1000, // Expired 1 second ago
      });

      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: "newpassword123" })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid or expired reset token",
      });
    });

    it("should return validation error for short password", async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({ password: "123" }) // Too short
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Validation failed",
      });
    });
  });

  describe("GET /api/auth/test-email", () => {
    it("should return email configuration status", async () => {
      const response = await request(app)
        .get("/api/auth/test-email")
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
      });

      // Verify email service test connection was called
      expect(emailService.default.testConnection).toHaveBeenCalled();
    });
  });
});
