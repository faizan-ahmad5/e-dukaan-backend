import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Required environment variables
const requiredEnvVars = [
  "MONGO_URI", // Updated to match your .env file
  "JWT_SECRET",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
];

// Optional environment variables with defaults
const optionalEnvVars = {
  PORT: "5000",
  NODE_ENV: "development",
  JWT_EXPIRE: "30d",
  FRONTEND_URL: "http://localhost:3000",
  EMAIL_FROM: process.env.EMAIL_USER,
};

// Validate environment variables
export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      if (key !== "EMAIL_FROM") {
        warnings.push(`${key} not set, using default: ${defaultValue}`);
      }
    }
  });

  // Check for production-specific requirements
  if (process.env.NODE_ENV === "production") {
    const productionRequired = ["STRIPE_SECRET_KEY", "FRONTEND_URL"];

    productionRequired.forEach((varName) => {
      if (!process.env[varName]) {
        warnings.push(`${varName} should be set in production`);
      }
    });

    // Validate JWT_SECRET strength in production
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push(
        "JWT_SECRET should be at least 32 characters in production"
      );
    }
  }

  // Log results
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error(
      "\nPlease check your .env file and ensure all required variables are set."
    );
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
  }

  console.log("✅ Environment configuration validated");

  // Log current environment
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Port: ${process.env.PORT}`);
  console.log(`📧 Email Provider: ${process.env.EMAIL_HOST}`);

  return true;
};

// Environment-specific configurations
export const getConfig = () => {
  return {
    port: parseInt(process.env.PORT, 10),
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    email: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM,
    },
    frontend: {
      url: process.env.FRONTEND_URL,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
    cors: {
      origins:
        process.env.NODE_ENV === "production"
          ? [process.env.FRONTEND_URL].filter(Boolean)
          : [
              "http://localhost:3000",
              "http://localhost:5173",
              "http://localhost:3001",
              process.env.FRONTEND_URL,
            ].filter(Boolean),
    },
  };
};

export default { validateEnvironment, getConfig };
