import { body, param, query, validationResult } from "express-validator";

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

export const validateForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  handleValidationErrors,
];

export const validateResetPassword = [
  param("token").isLength({ min: 1 }).withMessage("Reset token is required"),

  body("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  handleValidationErrors,
];

// Product validation rules
export const validateCreateProduct = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Product name must be between 1 and 200 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("price")
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage("Price must be a positive number up to 999999.99"),

  body("category")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category is required and must not exceed 50 characters"),

  body("brand")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Brand must not exceed 50 characters"),

  body("stock")
    .isInt({ min: 0, max: 999999 })
    .withMessage("Stock must be a non-negative integer up to 999999"),

  body("images")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Images must be an array with maximum 10 items"),

  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),

  handleValidationErrors,
];

export const validateUpdateProduct = [
  param("id").isMongoId().withMessage("Invalid product ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Product name must be between 1 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage("Price must be a positive number up to 999999.99"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must not exceed 50 characters"),

  body("brand")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Brand must not exceed 50 characters"),

  body("stock")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("Stock must be a non-negative integer up to 999999"),

  handleValidationErrors,
];

// Cart validation rules
export const validateAddToCart = [
  body("productId").isMongoId().withMessage("Invalid product ID"),

  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),

  handleValidationErrors,
];

export const validateUpdateCartItem = [
  param("itemId").isMongoId().withMessage("Invalid cart item ID"),

  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),

  handleValidationErrors,
];

// Order validation rules
export const validateCreateOrder = [
  body("items")
    .isArray({ min: 1, max: 50 })
    .withMessage("Order must contain between 1 and 50 items"),

  body("items.*.product")
    .isMongoId()
    .withMessage("Invalid product ID in order items"),

  body("items.*.quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Item quantity must be between 1 and 100"),

  body("shippingAddress.street")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(
      "Street address is required and must not exceed 200 characters"
    ),

  body("shippingAddress.city")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("City is required and must not exceed 50 characters"),

  body("shippingAddress.state")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("State is required and must not exceed 50 characters"),

  body("shippingAddress.zipCode")
    .trim()
    .matches(/^[0-9]{5}(-[0-9]{4})?$/)
    .withMessage("Please provide a valid ZIP code"),

  body("shippingAddress.country")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Country is required and must not exceed 50 characters"),

  body("paymentMethod")
    .isIn(["stripe", "paypal", "cash-on-delivery"])
    .withMessage("Payment method must be stripe, paypal, or cash-on-delivery"),

  handleValidationErrors,
];

// Review validation rules
export const validateCreateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters"),

  body("productId").isMongoId().withMessage("Invalid product ID"),

  body("orderId").isMongoId().withMessage("Invalid order ID"),

  handleValidationErrors,
];

// Generic validation rules
export const validateMongoId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),

  handleValidationErrors,
];

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Page must be a positive integer up to 1000"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sort")
    .optional()
    .isIn([
      "name",
      "price",
      "rating",
      "createdAt",
      "-name",
      "-price",
      "-rating",
      "-createdAt",
    ])
    .withMessage("Invalid sort option"),

  handleValidationErrors,
];

// User profile validation
export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Invalid gender option"),

  handleValidationErrors,
];
