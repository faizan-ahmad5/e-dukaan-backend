import { jest } from "@jest/globals";
import {
  AppError,
  sanitizeError,
  handleSpecificErrors,
  globalErrorHandler,
  asyncHandler,
  errors,
} from "../../utils/errorHandler.mjs";

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

jest.unstable_mockModule("../../utils/logger.mjs", () => ({
  default: mockLogger,
}));

describe("Error Handler Utils", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: "/api/test",
      method: "POST",
      ip: "127.0.0.1",
      get: jest.fn((header) => "test-user-agent"),
      body: { test: "data" },
      params: { id: "123" },
      query: { page: 1 },
      user: { id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Clear all mocks
    mockLogger.error.mockClear();
    res.status.mockClear();
    res.json.mockClear();
    next.mockClear();
  });

  describe("AppError", () => {
    it("should create error with all properties", () => {
      const error = new AppError("Test error", 400, true, "TEST_ERROR");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe("TEST_ERROR");
      expect(error.errorId).toBeDefined();
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe("AppError");
    });

    it("should use default values", () => {
      const error = new AppError("Test error");

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe(null);
    });
  });

  describe("sanitizeError", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it("should sanitize error messages in production", () => {
      const error = new AppError("Database connection failed", 500);
      const result = sanitizeError(error);

      expect(result).toBe("An internal server error occurred");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error details for debugging:",
        expect.any(Object)
      );
    });

    it("should return safe messages for different status codes", () => {
      const testCases = [
        { statusCode: 400, expected: "Invalid request data provided" },
        { statusCode: 401, expected: "Authentication credentials required" },
        { statusCode: 403, expected: "Access to this resource is forbidden" },
        { statusCode: 404, expected: "The requested resource was not found" },
        {
          statusCode: 409,
          expected: "Resource already exists or conflicts with current state",
        },
        { statusCode: 500, expected: "An internal server error occurred" },
      ];

      testCases.forEach(({ statusCode, expected }) => {
        const error = new AppError("Internal error", statusCode);
        const result = sanitizeError(error);
        expect(result).toBe(expected);
      });
    });

    it("should preserve error messages in development", () => {
      process.env.NODE_ENV = "development";

      const error = new AppError("Detailed error message", 500);
      const result = sanitizeError(error);

      expect(result).toBe("Detailed error message");
    });
  });

  describe("handleSpecificErrors", () => {
    it("should handle MongoDB duplicate key errors", () => {
      const mongoError = {
        code: 11000,
        keyValue: { email: "test@example.com" },
      };

      const result = handleSpecificErrors(mongoError);

      expect(result instanceof AppError).toBe(true);
      expect(result.message).toBe("Email 'test@example.com' already exists");
      expect(result.statusCode).toBe(409);
      expect(result.errorCode).toBe("DUPLICATE_KEY");
    });

    it("should handle Mongoose validation errors", () => {
      const validationError = {
        name: "ValidationError",
        errors: {
          email: { message: "Email is required" },
          password: { message: "Password must be at least 6 characters" },
        },
      };

      const result = handleSpecificErrors(validationError);

      expect(result instanceof AppError).toBe(true);
      expect(result.message).toBe(
        "Validation failed: Email is required, Password must be at least 6 characters"
      );
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe("VALIDATION_ERROR");
    });

    it("should handle JWT errors", () => {
      const jwtError = { name: "JsonWebTokenError" };
      const result = handleSpecificErrors(jwtError);

      expect(result instanceof AppError).toBe(true);
      expect(result.message).toBe("Invalid authentication token");
      expect(result.statusCode).toBe(401);
      expect(result.errorCode).toBe("INVALID_TOKEN");
    });

    it("should handle expired token errors", () => {
      const expiredError = { name: "TokenExpiredError" };
      const result = handleSpecificErrors(expiredError);

      expect(result instanceof AppError).toBe(true);
      expect(result.message).toBe("Authentication token has expired");
      expect(result.statusCode).toBe(401);
      expect(result.errorCode).toBe("TOKEN_EXPIRED");
    });

    it("should handle Mongoose cast errors", () => {
      const castError = {
        name: "CastError",
        kind: "ObjectId",
        path: "userId",
        value: "invalid-id",
      };

      const result = handleSpecificErrors(castError);

      expect(result instanceof AppError).toBe(true);
      expect(result.message).toBe("Invalid userId: invalid-id");
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe("INVALID_ID");
    });

    it("should handle file upload errors", () => {
      const fileSizeError = { code: "LIMIT_FILE_SIZE" };
      const result = handleSpecificErrors(fileSizeError);

      expect(result instanceof AppError).toBe(true);
      expect(result.message).toBe(
        "File size exceeds the maximum allowed limit"
      );
      expect(result.statusCode).toBe(413);
      expect(result.errorCode).toBe("FILE_TOO_LARGE");
    });
  });

  describe("globalErrorHandler", () => {
    it("should handle AppError correctly", () => {
      const error = new AppError("Test error", 400, true, "TEST_ERROR");

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
        errorId: error.errorId,
        timestamp: error.timestamp,
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("should convert regular errors to AppError", () => {
      const error = new Error("Regular error");
      error.statusCode = 400;

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
          errorId: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should include debug info in development", () => {
      process.env.NODE_ENV = "development";
      const error = new AppError("Test error", 400);

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: "Test error",
            stack: expect.any(String),
          }),
        })
      );

      delete process.env.NODE_ENV;
    });

    it("should log error with request context", () => {
      const error = new AppError("Test error", 400);

      globalErrorHandler(error, req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Application Error:",
        expect.objectContaining({
          errorId: error.errorId,
          message: error.message,
          statusCode: 400,
          url: "/api/test",
          method: "POST",
          ip: "127.0.0.1",
          userId: "user123",
        })
      );
    });
  });

  describe("asyncHandler", () => {
    it("should handle successful async functions", async () => {
      const successfulHandler = asyncHandler(async (req, res) => {
        res.json({ success: true });
      });

      await successfulHandler(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });

    it("should catch async errors and pass to next", async () => {
      const error = new Error("Async error");
      const failingHandler = asyncHandler(async () => {
        throw error;
      });

      await failingHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("Common Error Creators", () => {
    it("should create authentication errors", () => {
      const invalidCreds = errors.invalidCredentials();
      expect(invalidCreds.message).toBe("Invalid email or password");
      expect(invalidCreds.statusCode).toBe(401);
      expect(invalidCreds.errorCode).toBe("INVALID_CREDENTIALS");
    });

    it("should create authorization errors", () => {
      const accessDenied = errors.accessDenied();
      expect(accessDenied.message).toBe("Access denied");
      expect(accessDenied.statusCode).toBe(403);
      expect(accessDenied.errorCode).toBe("ACCESS_DENIED");
    });

    it("should create resource errors", () => {
      const notFound = errors.notFound("User");
      expect(notFound.message).toBe("User not found");
      expect(notFound.statusCode).toBe(404);
      expect(notFound.errorCode).toBe("NOT_FOUND");
    });

    it("should create business logic errors", () => {
      const insufficientStock = errors.insufficientStock();
      expect(insufficientStock.message).toBe("Insufficient stock available");
      expect(insufficientStock.statusCode).toBe(409);
      expect(insufficientStock.errorCode).toBe("INSUFFICIENT_STOCK");
    });
  });

  describe("Request Data Sanitization", () => {
    it("should sanitize sensitive fields in request logging", () => {
      req.body = {
        email: "test@example.com",
        password: "secret123",
        cardNumber: "4111111111111111",
      };

      const error = new AppError("Test error", 400);
      globalErrorHandler(error, req, res, next);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Application Error:",
        expect.objectContaining({
          body: {
            email: "test@example.com",
            password: "[REDACTED]",
            cardNumber: "[REDACTED]",
          },
        })
      );
    });
  });
});
