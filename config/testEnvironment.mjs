import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Override settings for testing
if (process.env.NODE_ENV === 'test') {
  // Override rate limiting for tests
  process.env.RATE_LIMIT_DISABLED = 'true';

  // Set default test values if not provided
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-testing-only';
  }

  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/e2e-test-database';
  }

  if (!process.env.EMAIL_USER) {
    process.env.EMAIL_USER = 'test@example.com';
  }

  if (!process.env.EMAIL_PASS) {
    process.env.EMAIL_PASS = 'test-password';
  }
}

export default {
  isTestEnvironment: process.env.NODE_ENV === 'test',
  rateLimitDisabled: process.env.RATE_LIMIT_DISABLED === 'true',
};
