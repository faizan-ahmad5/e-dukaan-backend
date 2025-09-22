import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { User } from "../../models/UserSchema.mjs";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../../controllers/authController.mjs";
import emailService from "../../utils/emailService.mjs";

// Mock response and request objects
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body = {}, params = {}, headers = {}) => ({
  body,
  params,
  headers,
  user: null,
});

describe("Auth Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      req.body = userData;

      // Mock User.findOne to return null (user doesn't exist)
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      // Mock User.save
      const mockUser = {
        _id: "user123",
        name: userData.name,
        email: userData.email,
        isVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User.prototype, "save").mockResolvedValue(mockUser);

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining("Registration successful"),
          data: expect.objectContaining({
            _id: expect.any(String),
            name: userData.name,
            email: userData.email,
            isVerified: false,
          }),
        })
      );
      expect(emailService.default.sendVerificationEmail).toHaveBeenCalled();
    });

    it("should return error if user already exists", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      req.body = userData;

      // Mock User.findOne to return existing user
      jest.spyOn(User, "findOne").mockResolvedValue({ email: userData.email });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User with this email already exists",
        })
      );
    });

    it("should handle missing email", async () => {
      req.body = {
        name: "John Doe",
        password: "password123",
        // email is missing
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Valid email is required",
        })
      );
    });
  });

  describe("loginUser", () => {
    it("should login user with valid credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      };

      req.body = loginData;

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: loginData.email,
        isAdmin: false,
        isVerified: true,
        lastLogin: new Date(),
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Login successful",
          data: expect.objectContaining({
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            token: expect.any(String),
          }),
        })
      );
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return error for invalid credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      req.body = loginData;

      const mockUser = {
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid credentials",
        })
      );
    });

    it("should return error if user not found", async () => {
      req.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid credentials",
        })
      );
    });

    it("should return error if user not verified", async () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      };

      req.body = loginData;

      const mockUser = {
        _id: "user123",
        isVerified: false,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Please verify your email address before logging in",
          needsVerification: true,
          userId: mockUser._id,
        })
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify email with valid token", async () => {
      req.params = { token: "valid-token" };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        isVerified: false,
        verificationToken: "hashed-token",
        verificationTokenExpire: Date.now() + 86400000, // 24 hours
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await verifyEmail(req, res);

      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.verificationToken).toBeUndefined();
      expect(mockUser.verificationTokenExpire).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(emailService.default.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Email verified successfully! You can now log in.",
        })
      );
    });

    it("should return error for invalid token", async () => {
      req.params = { token: "invalid-token" };

      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid or expired verification token",
        })
      );
    });

    it("should return error for missing token", async () => {
      req.params = {}; // No token

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Verification token is required",
        })
      );
    });
  });

  describe("forgotPassword", () => {
    it("should send password reset email for valid user", async () => {
      req.body = { email: "john@example.com" };

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
        isVerified: true,
        resetPasswordToken: null,
        resetPasswordExpire: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await forgotPassword(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(emailService.default.sendPasswordResetEmail).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Password reset email sent successfully",
        })
      );
    });

    it("should return error for non-existent user", async () => {
      req.body = { email: "nonexistent@example.com" };

      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User not found with that email",
        })
      );
    });

    it("should return error for unverified user", async () => {
      req.body = { email: "john@example.com" };

      const mockUser = {
        email: "john@example.com",
        isVerified: false,
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Please verify your email address first",
        })
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      req.params = { token: "valid-reset-token" };
      req.body = { password: "newpassword123" };

      const mockUser = {
        _id: "user123",
        resetPasswordToken: "hashed-token",
        resetPasswordExpire: Date.now() + 600000, // 10 minutes
        password: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

      await resetPassword(req, res);

      expect(mockUser.password).toBe("newpassword123");
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpire).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining("Password reset successfully"),
        })
      );
    });

    it("should return error for invalid token", async () => {
      req.params = { token: "invalid-token" };
      req.body = { password: "newpassword123" };

      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid or expired reset token",
        })
      );
    });

    it("should return error for password too short", async () => {
      req.params = { token: "valid-reset-token" };
      req.body = { password: "123" }; // Too short

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Password must be at least 6 characters long",
        })
      );
    });
  });
});
