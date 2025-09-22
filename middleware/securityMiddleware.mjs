import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Rate limiting middleware
export const createRateLimit = (
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests'
) => {
  const rateLimiter = rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Return a middleware that checks environment at runtime
  return (req, res, next) => {
    // Disable rate limiting in test environment (check at runtime)
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.RATE_LIMIT_DISABLED === 'true'
    ) {
      return next();
    }

    return rateLimiter(req, res, next);
  };
};

// Specific rate limits for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests from this IP'
);

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests for API
  'API rate limit exceeded'
);

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Data sanitization middleware
export const dataSanitization = [
  // Prevent NoSQL injection attacks
  mongoSanitize(),

  // Prevent XSS attacks
  xss(),

  // Prevent HTTP Parameter Pollution attacks
  hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'tags'],
  }),
];

// Input validation middleware
export const validateInput = validationRules => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = req.body[field];

      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (
        value &&
        rules.minLength &&
        value.toString().length < rules.minLength
      ) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (
        value &&
        rules.maxLength &&
        value.toString().length > rules.maxLength
      ) {
        errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
      }

      if (value && rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }

      if (value && rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

// File upload security
export const fileUploadSecurity = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
};

// API key validation middleware
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required',
    });
  }

  // In production, validate against a database or environment variable
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key',
    });
  }

  next();
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Use logger in production instead of console.log
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${new Date().toISOString()} - ${req.method} ${req.url} - ${
          res.statusCode
        } - ${duration}ms`
      );
    }
  });

  next();
};

// CORS security configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};
