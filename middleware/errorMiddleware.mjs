import { globalErrorHandler, AppError } from "../utils/errorHandler.mjs";
import { validationResult } from "express-validator";
import logger from "../utils/logger.mjs";

/**
 * Handle 404 errors for undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    true,
    "ROUTE_NOT_FOUND"
  );
  next(error);
};

/**
 * Main error handling middleware
 * Uses the centralized error handler for consistent error processing
 */
export const errorHandler = globalErrorHandler;

/**
 * Validation error handler for express-validator
 * Formats validation errors consistently
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      // Only expose values in development mode
      ...(process.env.NODE_ENV !== "production" && { value: error.value }),
    }));

    const error = new AppError(
      "Input validation failed",
      400,
      true,
      "VALIDATION_FAILED"
    );
    error.errors = formattedErrors;

    return next(error);
  }

  next();
};

/**
 * Handle async errors in route handlers
 * Can be used as a wrapper for async route handlers
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Development error handler with detailed information
 * Should only be used in development environment
 */
export const developmentErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "development") {
    return globalErrorHandler(err, req, res, next);
  }

  logger.error("Development Error Details:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
    },
    request: {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    timestamp: new Date().toISOString(),
  });
};
