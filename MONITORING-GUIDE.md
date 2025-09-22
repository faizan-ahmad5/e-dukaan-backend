# 📊 Monitoring & Alerts Setup

Comprehensive monitoring strategy for your e-commerce backend in production.

## 🎯 Monitoring Strategy

### 📈 **Core Metrics to Track**

1. **Application Health**: Uptime, response times, error rates
2. **Business Metrics**: Orders, registrations, cart conversions
3. **Infrastructure**: CPU, memory, database performance
4. **Security**: Failed login attempts, suspicious activity
5. **User Experience**: API response times, error patterns

## 🔧 Recommended Tools

### 🚨 **Error Tracking - Sentry** _(Essential)_

**Why**: Catch and track application errors in real-time

#### Setup Steps:

```bash
# 1. Install Sentry SDK
npm install @sentry/node @sentry/tracing

# 2. Add to your server.mjs (after environment config)
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    nodeProfilingIntegration(),
  ],
});

# 3. Add error handler middleware (before other error handlers)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... your routes ...
app.use(Sentry.Handlers.errorHandler());
```

#### Environment Variables:

```bash
# Get from https://sentry.io/settings/projects/
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 📊 **Performance Monitoring - New Relic** _(Recommended)_

**Why**: Deep application performance insights

#### Setup Steps:

```bash
# 1. Install New Relic agent
npm install newrelic

# 2. Create newrelic.js in project root
cp node_modules/newrelic/newrelic.js ./
# Edit with your license key and app name

# 3. Import at very top of server.mjs
import './newrelic.js';
// ... rest of your imports
```

#### Alternative: **Datadog APM**

```bash
# Install Datadog tracer
npm install dd-trace

# Add to top of server.mjs
import tracer from 'dd-trace';
tracer.init({
  env: process.env.NODE_ENV,
  service: 'ecommerce-backend',
  version: process.env.npm_package_version
});
```

### ⏰ **Uptime Monitoring - UptimeRobot** _(Free & Essential)_

**Why**: Get notified immediately when your API goes down

#### Setup Steps:

1. **Go to**: https://uptimerobot.com
2. **Add HTTP Monitor**:
   - URL: `https://your-api.com/health`
   - Interval: 5 minutes
   - Alert Contacts: Your email, Slack, SMS
3. **Add Keyword Monitor** for `/health` endpoint:
   - Keyword: `"success": true`
   - Alert if keyword NOT found

#### Alternative: **Pingdom**

- More detailed analytics
- Global monitoring locations
- Better reporting (paid)

### 📱 **Notification Channels**

#### Slack Integration:

```bash
# Add to your monitoring tools
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#alerts
```

#### Discord Integration:

```bash
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
```

## 📋 Monitoring Setup Checklist

### 🔴 **Critical (Must Have)**

- [ ] **Sentry Error Tracking**
  - Application errors
  - Performance monitoring
  - Release tracking
- [ ] **UptimeRobot Health Checks**
  - `/health` endpoint monitoring
  - Email/Slack alerts
  - 5-minute intervals
- [ ] **Database Monitoring**
  - MongoDB Atlas built-in monitoring
  - Connection pool metrics
  - Query performance

### 🟡 **Important (Should Have)**

- [ ] **APM Tool** (New Relic/Datadog)
  - Response time tracking
  - Database query analysis
  - Memory/CPU usage
- [ ] **Log Aggregation**
  - Structured logging
  - Log levels (error, warn, info, debug)
  - Searchable logs
- [ ] **Business Metrics**
  - Order conversion rates
  - User registration trends
  - Cart abandonment tracking

### 🟢 **Nice to Have**

- [ ] **Custom Dashboards**
  - Grafana for visualizations
  - Key business metrics
  - Real-time charts
- [ ] **Security Monitoring**
  - Failed login attempts
  - Unusual API usage patterns
  - Rate limit violations
- [ ] **Mobile Alerts**
  - PagerDuty for critical alerts
  - SMS notifications
  - On-call rotation

## 🛠️ Implementation Guide

### 1. **Add Monitoring Code to Server**

Create `utils/monitoring.mjs`:

```javascript
import * as Sentry from '@sentry/node';

// Custom metrics tracking
export const trackBusinessMetric = (metric, value, tags = {}) => {
  // Send to your APM tool
  console.info(`[METRIC] ${metric}: ${value}`, tags);

  // Example: Track in Sentry
  Sentry.addBreadcrumb({
    message: `Business Metric: ${metric}`,
    data: { value, ...tags },
    level: 'info',
  });
};

// Performance tracking
export const trackPerformance = (operation, duration, success = true) => {
  const tags = { operation, success };
  console.info(`[PERF] ${operation}: ${duration}ms`, tags);
};

// Security event tracking
export const trackSecurityEvent = (event, details = {}) => {
  console.warn(`[SECURITY] ${event}`, details);
  Sentry.captureMessage(`Security Event: ${event}`, 'warning');
};
```

### 2. **Add Business Metrics to Controllers**

Example in `orderController.mjs`:

```javascript
import { trackBusinessMetric } from '../utils/monitoring.mjs';

export const createOrder = async (req, res) => {
  const startTime = Date.now();

  try {
    // ... order creation logic

    // Track successful order
    trackBusinessMetric('orders_created', 1, {
      userId: req.user.id,
      amount: order.totalAmount,
    });

    // Track performance
    const duration = Date.now() - startTime;
    trackPerformance('create_order', duration, true);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    // Track failed order
    trackPerformance('create_order', Date.now() - startTime, false);
    throw error;
  }
};
```

### 3. **Enhanced Health Check Endpoint**

Update your health check in `server.mjs`:

```javascript
app.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks: {},
  };

  try {
    // Database health check
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    healthCheck.checks.database = {
      status: 'UP',
      responseTime: Date.now() - dbStart,
    };

    // Redis health check (if using)
    if (process.env.REDIS_URL) {
      // Add redis ping check
      healthCheck.checks.redis = { status: 'UP' };
    }

    // External services health check
    if (process.env.STRIPE_SECRET_KEY) {
      healthCheck.checks.stripe = { status: 'CONFIGURED' };
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.checks.database = {
      status: 'DOWN',
      error: error.message,
    };
    res.status(503).json(healthCheck);
  }
});
```

## 📊 Dashboard Setup

### Grafana Dashboard (Optional)

```bash
# If using Docker Compose for monitoring stack
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

## 🚨 Alert Configuration

### Critical Alerts (Immediate Response)

- API completely down (5xx errors > 50%)
- Database connection failed
- Memory usage > 90%
- Error rate > 10% for 5 minutes

### Warning Alerts (Within Hours)

- Response time > 2 seconds consistently
- Failed login attempts spike
- Disk space > 80%
- High number of 4xx errors

### Info Alerts (Daily Summary)

- New user registrations
- Order volume changes
- Performance trends

## 🧪 Testing Your Monitoring

### Test Error Tracking:

```bash
# Create a test error endpoint
app.get('/test-error', (req, res) => {
  throw new Error('Test error for monitoring');
});

# Visit: https://your-api.com/test-error
# Check if error appears in Sentry
```

### Test Uptime Monitoring:

```bash
# Temporarily break health endpoint
app.get('/health', (req, res) => {
  res.status(500).json({ status: 'DOWN' });
});

# Check if UptimeRobot sends alert
```

## 💰 Cost Estimates (Monthly)

| Tool        | Free Tier        | Paid Plans             |
| ----------- | ---------------- | ---------------------- |
| Sentry      | 5K errors/month  | $26/month (50K errors) |
| New Relic   | 100GB data/month | $25/month (unlimited)  |
| UptimeRobot | 50 monitors      | $7/month (unlimited)   |
| Datadog     | 14-day trial     | $15/month (1 host)     |
| PagerDuty   | 14-day trial     | $21/month (5 users)    |

**Total Cost**: $0-100/month depending on scale

## 🎯 Quick Start (15 minutes)

1. **Set up Sentry** (5 min):
   - Create account → Get DSN → Add to code → Deploy
2. **Configure UptimeRobot** (5 min):
   - Add health check monitor → Set up Slack alerts
3. **Add Business Metrics** (5 min):
   - Track key events (orders, registrations, errors)

---

💡 **Pro Tip**: Start with free tiers, then upgrade as you scale. Focus on error tracking and uptime monitoring first!

🎯 **Next Steps**: Choose your monitoring stack → Configure alerts → Test thoroughly → Monitor your first production deployment!
