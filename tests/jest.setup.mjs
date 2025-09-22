// Setup file for Jest ES modules
import { jest, describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import dotenv from "dotenv";

// Make jest globals available
global.jest = jest;
global.describe = describe;
global.it = it;
global.expect = expect;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.afterEach = afterEach;

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
process.env.EMAIL_HOST = "test-host";
process.env.EMAIL_PORT = "587";
process.env.EMAIL_USER = "test@example.com";
process.env.EMAIL_PASS = "test-password";
process.env.STRIPE_SECRET_KEY = "sk_test_fake_stripe_key";

// Mock mongoose for now (we'll add real DB setup later)
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  Schema: function(definition) {
    const schema = Object.assign({}, definition);
    schema.index = jest.fn();
    schema.virtual = jest.fn().mockReturnValue({
      get: jest.fn()
    });
    schema.pre = jest.fn();
    schema.post = jest.fn();
    schema.methods = {};
    schema.statics = {};
    return schema;
  },
  model: jest.fn().mockImplementation((name, schema) => {
    return class MockModel {
      constructor(data) {
        Object.assign(this, data);
      }
      save() { return Promise.resolve(this); }
      static find() { return Promise.resolve([]); }
      static findOne() { return Promise.resolve(null); }
      static findById() { return Promise.resolve(null); }
      static findByIdAndDelete() { return Promise.resolve(null); }
      static findByIdAndUpdate() { return Promise.resolve(null); }
      static create() { return Promise.resolve({}); }
      static updateOne() { return Promise.resolve({ modifiedCount: 1 }); }
      static deleteOne() { return Promise.resolve({ deletedCount: 1 }); }
      static countDocuments() { return Promise.resolve(0); }
    };
  }),
  connection: {
    readyState: 1,
    collections: {}
  }
}));

// Global test utilities
global.createTestUser = (overrides = {}) => ({
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  isVerified: true,
  isAdmin: false,
  ...overrides,
});

global.createTestProduct = (overrides = {}) => ({
  title: "Test Product",
  description: "Test product description",
  price: 99.99,
  category: "Electronics",
  brand: "Test Brand",
  image: "test-image.jpg",
  inventory: {
    inStock: true,
    quantity: 10,
  },
  ...overrides,
});

// Mock logger to prevent console spam during tests
jest.mock('../utils/logger.mjs', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  requestLogger: (req, res, next) => next(),
}));

// Mock email service  
jest.mock('../utils/emailService.mjs', () => ({
  default: {
    sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
    generateVerificationToken: jest.fn().mockReturnValue("test-token"),
    generateResetToken: jest.fn().mockReturnValue({
      token: "reset-token",
      hashedToken: "hashed-reset-token",
    }),
    testConnection: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock error handler
jest.mock('../utils/errorHandler.mjs', () => ({
  globalErrorHandler: jest.fn((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  }),
  AppError: class MockAppError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  }
}));
