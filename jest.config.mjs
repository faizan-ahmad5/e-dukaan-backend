export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.mjs'],
  testMatch: [
    '<rootDir>/tests/**/*.test.mjs',
    '<rootDir>/tests/**/*.spec.mjs',
    '!**/tests/e2e/**',
  ],
  collectCoverageFrom: [
    'controllers/**/*.mjs',
    'middleware/**/*.mjs',
    'utils/**/*.mjs',
    'models/**/*.mjs',
    'routes/**/*.mjs',
    'config/**/*.mjs',
  ],
  coverageThreshold: {
    global: {
      branches: 30, // Reduced threshold temporarily
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
