// Standardized API response format
export const apiResponse = {
  success: (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  },

  error: (
    res,
    message = "Internal Server Error",
    statusCode = 500,
    errors = null
  ) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  },

  paginated: (res, data, pagination, message = "Success") => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        limit: pagination.limit,
      },
      timestamp: new Date().toISOString(),
    });
  },
};

// API response middleware to ensure consistent format
export const standardizeResponse = (req, res, next) => {
  // Override res.json to add timestamp if not already present
  const originalJson = res.json;
  res.json = function (data) {
    if (typeof data === "object" && data !== null && !data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    return originalJson.call(this, data);
  };
  next();
};

// Health check endpoint
export const healthCheck = (req, res) => {
  const healthData = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
  };

  return apiResponse.success(res, healthData, "Service is healthy");
};

// API documentation endpoint
export const apiDocs = (req, res) => {
  const docs = {
    title: "E-Dukaan API Documentation",
    version: "1.0.0",
    description:
      "Complete e-commerce backend API with authentication, products, orders, and payments",
    baseUrl: `${req.protocol}://${req.get("host")}`,
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        verifyEmail: "GET /api/auth/verify-email/:token",
        forgotPassword: "POST /api/auth/forgot-password",
        resetPassword: "POST /api/auth/reset-password/:token",
      },
      users: {
        profile: "GET /api/users/profile",
        updateProfile: "PUT /api/users/profile",
        deleteAccount: "DELETE /api/users/profile",
      },
      products: {
        getAll: "GET /api/products",
        getById: "GET /api/products/:id",
        create: "POST /api/products (Admin only)",
        update: "PUT /api/products/:id (Admin only)",
        delete: "DELETE /api/products/:id (Admin only)",
      },
      cart: {
        getCart: "GET /api/cart",
        addItem: "POST /api/cart",
        updateItem: "PUT /api/cart/:itemId",
        removeItem: "DELETE /api/cart/:itemId",
        clearCart: "DELETE /api/cart",
      },
      orders: {
        getOrders: "GET /api/orders",
        getById: "GET /api/orders/:id",
        create: "POST /api/orders",
        updateStatus: "PUT /api/orders/:id/status (Admin only)",
      },
      reviews: {
        getReviews: "GET /api/reviews",
        create: "POST /api/reviews",
        update: "PUT /api/reviews/:id",
        delete: "DELETE /api/reviews/:id",
      },
      wishlist: {
        getWishlist: "GET /api/wishlist",
        addItem: "POST /api/wishlist",
        removeItem: "DELETE /api/wishlist/:productId",
      },
      payment: {
        createSession: "POST /api/payment",
      },
    },
    responseFormat: {
      success: {
        success: true,
        message: "Success message",
        data: "Response data",
        timestamp: "ISO timestamp",
      },
      error: {
        success: false,
        message: "Error message",
        errors: "Validation errors (optional)",
        timestamp: "ISO timestamp",
      },
      paginated: {
        success: true,
        message: "Success message",
        data: "Array of items",
        pagination: {
          currentPage: "Current page number",
          totalPages: "Total pages",
          totalItems: "Total items count",
          hasNextPage: "Boolean",
          hasPrevPage: "Boolean",
          limit: "Items per page",
        },
        timestamp: "ISO timestamp",
      },
    },
    authentication: {
      type: "Bearer Token (JWT)",
      header: "Authorization: Bearer <token>",
      description:
        "Include JWT token in Authorization header for protected routes",
    },
    rateLimiting: {
      general: "100 requests per 15 minutes",
      auth: "5 requests per 15 minutes",
      description: "Rate limits are applied per IP address",
    },
    errorCodes: {
      400: "Bad Request - Invalid input data",
      401: "Unauthorized - Missing or invalid authentication",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource not found",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error - Server error",
    },
  };

  return apiResponse.success(res, docs, "API Documentation");
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  return errors.map((error) => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value,
  }));
};

// Generic pagination helper
export const getPaginationInfo = (page, limit, totalItems) => {
  const currentPage = parseInt(page, 10) || 1;
  const itemsPerPage = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    page: currentPage,
    limit: itemsPerPage,
    totalPages,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    skip: (currentPage - 1) * itemsPerPage,
  };
};

export default {
  apiResponse,
  standardizeResponse,
  healthCheck,
  apiDocs,
  asyncHandler,
  formatValidationErrors,
  getPaginationInfo,
};
