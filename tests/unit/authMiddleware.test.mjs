import jwt from "jsonwebtoken";
import { User } from "../../models/UserSchema.mjs";
import { protect, isAdmin } from "../../middleware/authMiddleware.mjs";

// Mock response and request objects
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (headers = {}) => ({
  headers,
  user: null,
});

const mockNext = jest.fn();

describe("Auth Middleware - Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("protect middleware", () => {
    it("should authenticate user with valid token", async () => {
      const userId = "user123";
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockUser = {
        _id: userId,
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await protect(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockQuery.select).toHaveBeenCalledWith("-password");
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it("should return error for invalid token", async () => {
      req.headers = {
        authorization: "Bearer invalid-token",
      };

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized, token failed",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error for expired token", async () => {
      const userId = "user123";
      const expiredToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "-1h",
      });

      req.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized, token failed",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error for missing token", async () => {
      req.headers = {}; // No authorization header

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized, no token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error for malformed authorization header", async () => {
      req.headers = {
        authorization: "InvalidFormat token123", // Should be "Bearer token"
      };

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized, no token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle user not found in database", async () => {
      const userId = "nonexistent";
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(null), // User not found
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await protect(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const userId = "user123";
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      const error = new Error("Database connection error");
      const mockQuery = {
        select: jest.fn().mockRejectedValue(error),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized, token failed",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin middleware", () => {
    it("should allow access for admin user", () => {
      req.user = {
        _id: "admin123",
        name: "Admin User",
        email: "admin@example.com",
        isAdmin: true,
      };

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access for non-admin user", () => {
      req.user = {
        _id: "user123",
        name: "Regular User",
        email: "user@example.com",
        isAdmin: false,
      };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized as an admin",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access when user is not set", () => {
      req.user = null;

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized as an admin",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access when user object missing isAdmin property", () => {
      req.user = {
        _id: "user123",
        name: "User",
        email: "user@example.com",
        // isAdmin property is missing
      };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized as an admin",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle middleware errors gracefully", () => {
      req.user = {
        _id: "user123",
        name: "User",
        email: "user@example.com",
        isAdmin: "invalid-value", // Should be boolean
      };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server Error",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("middleware integration", () => {
    it("should work together - protect then isAdmin for admin user", async () => {
      const adminId = "admin123";
      const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockAdminUser = {
        _id: adminId,
        name: "Admin User",
        email: "admin@example.com",
        isAdmin: true,
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockAdminUser),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      // First middleware - protect
      await protect(req, res, next);
      expect(req.user).toBe(mockAdminUser);
      expect(next).toHaveBeenCalledTimes(1);

      // Reset next mock
      next.mockReset();

      // Second middleware - isAdmin
      isAdmin(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should work together - protect then isAdmin for regular user", async () => {
      const userId = "user123";
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockRegularUser = {
        _id: userId,
        name: "Regular User",
        email: "user@example.com",
        isAdmin: false,
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRegularUser),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      // First middleware - protect
      await protect(req, res, next);
      expect(req.user).toBe(mockRegularUser);
      expect(next).toHaveBeenCalledTimes(1);

      // Reset mocks
      next.mockReset();
      res.status.mockReset();
      res.json.mockReset();

      // Second middleware - isAdmin
      isAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized as an admin",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
