import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

let mongoServer;

// Setup test database
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);

  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
  process.env.EMAIL_HOST = "test-host";
  process.env.EMAIL_PORT = "587";
  process.env.EMAIL_USER = "test@example.com";
  process.env.EMAIL_PASS = "test-password";
  process.env.STRIPE_SECRET_KEY = "sk_test_fake_stripe_key";
});

// Clean up after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

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
jest.mock("../utils/logger.mjs", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  requestLogger: (req, res, next) => next(),
}));

// Mock email service
jest.mock("../utils/emailService.mjs", () => ({
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
