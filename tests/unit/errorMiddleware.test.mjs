import {
  notFound,
  errorHandler,
  handleValidationErrors,
} from '../../middleware/errorMiddleware.mjs';

// Mocks are handled globally in jest.setup.mjs - no local mocking needed

// Mock express-validator for this test
const mockValidationResult = jest.fn();
jest.doMock('express-validator', () => ({
  validationResult: mockValidationResult,
}));

describe('Error Middleware - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Clear all mocks
    mockGlobalErrorHandler.mockClear();
    mockAppError.mockClear();
    mockLogger.error.mockClear();
    res.status.mockClear();
    res.json.mockClear();
    next.mockClear();
  });

  describe('notFound middleware', () => {
    it('should create 404 error for undefined routes', () => {
      notFound(req, res, next);

      expect(mockAppError).toHaveBeenCalledWith(
        'Route not found: GET /api/test',
        404,
        true,
        'ROUTE_NOT_FOUND'
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe('errorHandler middleware', () => {
    it('should delegate to global error handler', () => {
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(mockGlobalErrorHandler).toHaveBeenCalledWith(
        error,
        req,
        res,
        next
      );
    });
  });

  describe('handleValidationErrors middleware', () => {
    let mockValidationResult;

    beforeEach(async () => {
      const { validationResult } = await import('express-validator');
      mockValidationResult = validationResult;
    });

    it('should pass through when no validation errors', () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(mockAppError).not.toHaveBeenCalled();
    });

    it('should create AppError when validation fails', () => {
      const mockErrors = [
        { path: 'email', msg: 'Invalid email', value: 'invalid-email' },
        { path: 'password', msg: 'Password too short', value: '123' },
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(req, res, next);

      expect(mockAppError).toHaveBeenCalledWith(
        'Input validation failed',
        400,
        true,
        'VALIDATION_FAILED'
      );
      expect(next).toHaveBeenCalled();
    });

    it('should format validation errors properly in development', () => {
      process.env.NODE_ENV = 'development';

      const mockErrors = [
        { path: 'email', msg: 'Invalid email', value: 'test@invalid' },
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      const mockErrorInstance = {
        errors: undefined,
      };
      mockAppError.mockReturnValue(mockErrorInstance);

      handleValidationErrors(req, res, next);

      expect(mockErrorInstance.errors).toEqual([
        {
          field: 'email',
          message: 'Invalid email',
          value: 'test@invalid',
        },
      ]);

      delete process.env.NODE_ENV;
    });

    it('should hide validation values in production', () => {
      process.env.NODE_ENV = 'production';

      const mockErrors = [
        { path: 'password', msg: 'Password required', value: 'secret123' },
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      const mockErrorInstance = {
        errors: undefined,
      };
      mockAppError.mockReturnValue(mockErrorInstance);

      handleValidationErrors(req, res, next);

      expect(mockErrorInstance.errors).toEqual([
        {
          field: 'password',
          message: 'Password required',
        },
      ]);

      delete process.env.NODE_ENV;
    });

    it('should handle errors with param field', () => {
      const mockErrors = [{ param: 'id', msg: 'Invalid ID', value: 'abc123' }];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      const mockErrorInstance = {
        errors: undefined,
      };
      mockAppError.mockReturnValue(mockErrorInstance);

      handleValidationErrors(req, res, next);

      expect(mockErrorInstance.errors).toEqual([
        {
          field: 'id',
          message: 'Invalid ID',
        },
      ]);
    });
  });
});
