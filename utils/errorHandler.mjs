import logger from "./logger.mjs";

// Simple UUID alternative until uuid package is installed
const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Custom Application Error Class
 * Extends native Error with additional properties for better error handling
 */
export class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    isOperational = true,
    errorCode = null
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.errorId = generateId();
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitizes error messages for production
 * Prevents information disclosure while preserving debugging info in logs
 */
export const sanitizeError = (error) => {
  // Always log full error details for debugging
  if (error.errorId) {
    logger.error("Error details for debugging:", {
      errorId: error.errorId,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      name: error.name,
    });
  }

  // Return safe messages in production
  if (process.env.NODE_ENV === "production") {
    const safeMessages = {
      400: "Invalid request data provided",
      401: "Authentication credentials required",
      403: "Access to this resource is forbidden",
      404: "The requested resource was not found",
      409: "Resource already exists or conflicts with current state",
      422: "The request data could not be processed",
      429: "Too many requests, please try again later",
      500: "An internal server error occurred",
      502: "Service temporarily unavailable",
      503: "Service temporarily unavailable",
    };

    const statusCode = error.statusCode || 500;
    return safeMessages[statusCode] || safeMessages[500];
  }

  // In development, return the actual error message
  return error.message || "An unexpected error occurred";
};

/**
 * Handles different types of database and application errors
 */
export const handleSpecificErrors = (err) => {
  let error = { ...err };

  // MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field] || "";
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } '${value}' already exists`;
    error = new AppError(message, 409, true, "DUPLICATE_KEY");
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    const message = `Validation failed: ${errors.join(", ")}`;
    error = new AppError(message, 400, true, "VALIDATION_ERROR");
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, true, "INVALID_ID");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError(
      "Invalid authentication token",
      401,
      true,
      "INVALID_TOKEN"
    );
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError(
      "Authentication token has expired",
      401,
      true,
      "TOKEN_EXPIRED"
    );
  }

  // Multer file upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new AppError(
      "File size exceeds the maximum allowed limit",
      413,
      true,
      "FILE_TOO_LARGE"
    );
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    error = new AppError(
      "Too many files uploaded at once",
      413,
      true,
      "TOO_MANY_FILES"
    );
  }

  // Stripe payment errors
  if (err.type === "StripeCardError") {
    error = new AppError(
      "Payment failed: " + err.message,
      402,
      true,
      "PAYMENT_FAILED"
    );
  }

  return error;
};

/**
 * Global error handling middleware
 * Centralizes all error processing and response formatting
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Handle specific error types
  let error = handleSpecificErrors(err);

  // Ensure error has required properties
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500,
      error.isOperational || false
    );
  }

  // Log error with request context
  logger.error("Application Error:", {
    errorId: error.errorId,
    message: error.message,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id || "anonymous",
    body: sanitizeRequestData(req.body),
    params: req.params,
    query: sanitizeRequestData(req.query),
    timestamp: new Date().toISOString(),
  });

  // Prepare error response
  const errorResponse = {
    success: false,
    message: sanitizeError(error),
    errorId: error.errorId,
    timestamp: error.timestamp,
  };

  // Add additional info in development
  if (process.env.NODE_ENV !== "production") {
    errorResponse.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
    };
  }

  // Add error code if available (for frontend handling)
  if (error.errorCode) {
    errorResponse.errorCode = error.errorCode;
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch async errors
 * Automatically passes errors to global error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Sanitizes request data to remove sensitive information from logs
 */
const sanitizeRequestData = (data) => {
  if (!data || typeof data !== "object") return data;

  const sanitized = { ...data };
  const sensitiveFields = [
    "password",
    "confirmPassword",
    "token",
    "refreshToken",
    "apiKey",
    "secret",
    "key",
    "authorization",
    "auth",
    "cardNumber",
    "cvv",
    "ssn",
    "socialSecurityNumber",
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
};

/**
 * Creates standardized API responses
 */
export const createErrorResponse = (
  message,
  statusCode = 500,
  errorCode = null,
  errors = null
) => {
  return new AppError(message, statusCode, true, errorCode, errors);
};

/**
 * Common error creators for frequently used errors
 */
export const errors = {
  // Authentication errors
  invalidCredentials: () =>
    new AppError("Invalid email or password", 401, true, "INVALID_CREDENTIALS"),
  tokenRequired: () =>
    new AppError(
      "Authentication token is required",
      401,
      true,
      "TOKEN_REQUIRED"
    ),
  tokenInvalid: () =>
    new AppError("Invalid or malformed token", 401, true, "TOKEN_INVALID"),
  tokenExpired: () =>
    new AppError(
      "Authentication token has expired",
      401,
      true,
      "TOKEN_EXPIRED"
    ),

  // Authorization errors
  accessDenied: () => new AppError("Access denied", 403, true, "ACCESS_DENIED"),
  adminRequired: () =>
    new AppError(
      "Administrator privileges required",
      403,
      true,
      "ADMIN_REQUIRED"
    ),
  ownershipRequired: () =>
    new AppError(
      "You can only access your own resources",
      403,
      true,
      "OWNERSHIP_REQUIRED"
    ),

  // Resource errors
  notFound: (resource = "Resource") =>
    new AppError(`${resource} not found`, 404, true, "NOT_FOUND"),
  alreadyExists: (resource = "Resource") =>
    new AppError(`${resource} already exists`, 409, true, "ALREADY_EXISTS"),

  // Validation errors
  validationFailed: (details) =>
    new AppError(
      "Input validation failed",
      400,
      true,
      "VALIDATION_FAILED",
      details
    ),
  invalidInput: (field) =>
    new AppError(`Invalid ${field} provided`, 400, true, "INVALID_INPUT"),

  // Business logic errors
  insufficientStock: () =>
    new AppError(
      "Insufficient stock available",
      409,
      true,
      "INSUFFICIENT_STOCK"
    ),
  paymentFailed: (reason) =>
    new AppError(`Payment failed: ${reason}`, 402, true, "PAYMENT_FAILED"),
  orderNotFound: () =>
    new AppError("Order not found", 404, true, "ORDER_NOT_FOUND"),

  // System errors
  databaseError: () =>
    new AppError("Database operation failed", 500, false, "DATABASE_ERROR"),
  externalServiceError: () =>
    new AppError(
      "External service unavailable",
      502,
      false,
      "EXTERNAL_SERVICE_ERROR"
    ),
  configurationError: () =>
    new AppError(
      "Server configuration error",
      500,
      false,
      "CONFIGURATION_ERROR"
    ),
};

export default {
  AppError,
  sanitizeError,
  handleSpecificErrors,
  globalErrorHandler,
  asyncHandler,
  createErrorResponse,
  errors,
};
