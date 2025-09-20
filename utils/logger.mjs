import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

// Create logger class
class Logger {
  constructor() {
    this.logFile = path.join(
      logsDir,
      `app-${new Date().toISOString().split("T")[0]}.log`
    );
    this.errorFile = path.join(
      logsDir,
      `error-${new Date().toISOString().split("T")[0]}.log`
    );
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };
    return JSON.stringify(logEntry) + "\n";
  }

  writeToFile(filePath, content) {
    try {
      fs.appendFileSync(filePath, content, "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Write to main log file
    this.writeToFile(this.logFile, formattedMessage);

    // Write errors to separate error file
    if (level === LOG_LEVELS.ERROR) {
      this.writeToFile(this.errorFile, formattedMessage);
    }

    // Console output with colors
    const colors = {
      ERROR: "\x1b[31m", // Red
      WARN: "\x1b[33m", // Yellow
      INFO: "\x1b[36m", // Cyan
      DEBUG: "\x1b[90m", // Gray
    };
    const reset = "\x1b[0m";

    if (process.env.NODE_ENV !== "test") {
      // Sanitize message to prevent format string vulnerabilities
      const sanitizedMessage =
        typeof message === "string"
          ? message.replace(/%(s|d|j|%)/g, "%%$1")
          : String(message);
      console.log(
        `${colors[level]}[${level}]${reset} ${sanitizedMessage}`,
        meta
      );
    }
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }

  // Log HTTP requests
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || "anonymous",
    };

    const level = res.statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    this.log(level, `HTTP ${req.method} ${req.originalUrl}`, logData);
  }

  // Log authentication events
  logAuth(event, userId, email, meta = {}) {
    this.info(`Auth: ${event}`, {
      userId,
      email,
      ...meta,
    });
  }

  // Log business events
  logBusiness(event, data = {}) {
    this.info(`Business: ${event}`, data);
  }

  // Log performance metrics
  logPerformance(operation, duration, meta = {}) {
    this.info(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta,
    });
  }

  // Clean old log files (keep last 30 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(logsDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach((file) => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error("Failed to clean old log files", { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

// Express middleware for request logging
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

// Graceful shutdown handler
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

export default logger;
