# E-Dukaan: Enterprise E-Commerce Backend API

<div align="center">
  <h2>🛒 Production-Ready E-Commerce Solution</h2>
  <p><em>A robust, scalable, and secure e-commerce backend built with modern technologies</em></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.21-blue.svg)](https://expressjs.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 🌟 **Overview**

E-Dukaan is an enterprise-grade e-commerce backend API designed for modern web applications. Built with Node.js and Express, it provides comprehensive functionality for online stores, marketplaces, and e-commerce platforms with production-ready security, monitoring, and scalability features.

### ✨ **Key Highlights**

- 🔒 **Enterprise Security**: Multi-layer security with rate limiting, input validation, and XSS protection
- 📊 **Production Monitoring**: Comprehensive logging, health checks, and performance metrics
- 🚀 **High Performance**: Optimized database queries, efficient middleware, and scalable architecture
- 📱 **Frontend Ready**: Standardized APIs perfect for React, Vue, Angular, or any frontend framework
- 🌍 **Environment Flexible**: Dev/staging/production configurations with validation
- 📧 **Email Integration**: Complete email system for verification, notifications, and marketing

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Applications                  │
│          (React, Vue, Angular, Mobile Apps)             │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API Calls
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  E-Dukaan Backend API                   │
├─────────────────────────────────────────────────────────┤
│  Authentication │ Products │ Orders │ Payments │ Users  │
├─────────────────────────────────────────────────────────┤
│     Security Middleware │ Validation │ Rate Limiting    │
├─────────────────────────────────────────────────────────┤
│        Logging │ Monitoring │ Health Checks             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│            MongoDB Atlas │ Stripe │ Email Service       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 **Core Features**

### 🔐 **Authentication & Security**

- **JWT Authentication** with secure token management
- **Role-Based Access Control** (Admin/User permissions)
- **Email Verification System** with automated workflows
- **Password Reset** with secure token validation
- **Rate Limiting** (5 auth attempts/15min, 100 API calls/15min)
- **Input Sanitization** against SQL/NoSQL injection
- **XSS Protection** and CSRF prevention
- **Security Headers** via Helmet middleware

### 🛍️ **E-Commerce Core**

- **Product Management**: CRUD with categories, inventory, SEO optimization
- **Shopping Cart**: Persistent cart with quantity management
- **Order Processing**: Complete lifecycle from creation to fulfillment
- **Payment Integration**: Secure Stripe checkout sessions
- **Wishlist Management**: Save products for later
- **Review & Rating System**: Verified purchase reviews
- **Image Processing**: Multi-format upload with optimization
- **Inventory Tracking**: Stock management with low-stock alerts

### 📊 **Enterprise Features**

- **Comprehensive Logging**: Structured JSON logs with rotation
- **Health Monitoring**: System metrics and status endpoints
- **API Documentation**: Auto-generated documentation endpoint
- **Input Validation**: Express-validator for critical endpoints (auth, products, cart, orders)
- **Environment Management**: Validation and configuration
- **Error Handling**: Graceful error management and reporting
- **Performance Optimization**: Database indexing and query optimization

---

## 🛠️ **Technology Stack**

<table>
<tr>
<td>

**Backend Core**

- Node.js 18+ (ES Modules)
- Express.js 4.21
- MongoDB Atlas with Mongoose
- JWT for authentication

</td>
<td>

**Security & Validation**

- Helmet (Security headers)
- Express Rate Limit
- Express Validator
- Bcryptjs (Password hashing)

</td>
</tr>
<tr>
<td>

**Integrations**

- Stripe (Payment processing)
- Nodemailer (Email service)
- Sharp (Image processing)
- Multer (File uploads)

</td>
<td>

**Monitoring & Utils**

- Custom structured logging
- Health check endpoints
- Environment validation
- CORS configuration

</td>
</tr>
</table>

---

## 📋 **API Endpoints**

### 🔑 **Authentication**

```http
POST   /api/auth/register          # User registration with email verification
POST   /api/auth/login             # User login with JWT token
GET    /api/auth/verify-email/:token   # Email verification
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password/:token # Password reset confirmation
GET    /api/auth/test-email        # Email service testing
```

### 👤 **User Management**

```http
GET    /api/users/profile/me       # Get current user profile
PUT    /api/users/:id/avatar       # Update user avatar
GET    /api/users                  # Get all users (Admin only)
PUT    /api/users/:id              # Update user (Admin only)
DELETE /api/users/:id              # Delete user (Admin only)
```

### 🛍️ **Products**

```http
GET    /api/products               # List products (paginated)
GET    /api/products/:id           # Get product details
POST   /api/products               # Create product (Admin only)
PUT    /api/products/:id           # Update product (Admin only)
DELETE /api/products/:id           # Delete product (Admin only)
```

### 🛒 **Shopping Cart**

```http
GET    /api/cart                   # Get user's cart
POST   /api/cart                   # Add item to cart
PUT    /api/cart/:itemId           # Update cart item quantity
DELETE /api/cart/:itemId           # Remove item from cart
DELETE /api/cart                   # Clear entire cart
```

### 📦 **Orders**

```http
GET    /api/orders                 # List user orders
GET    /api/orders/:id             # Get order details
POST   /api/orders                 # Create new order
PUT    /api/orders/:id/status      # Update order status (Admin only)
```

### 💳 **Payments**

```http
POST   /api/payment                # Create Stripe checkout session
```

### 🔧 **System**

```http
GET    /health                     # Health check with system metrics
GET    /docs                       # API documentation
```

---

## 🚀 **Quick Start**

### 1️⃣ **Prerequisites**

- Node.js 18+ installed
- MongoDB Atlas account
- Stripe account (for payments)
- Email service (Gmail recommended)

### 2️⃣ **Installation**

```bash
# Clone the repository
git clone https://github.com/faizan-ahmad5/e-dukaan-backend.git
cd e-dukaan-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3️⃣ **Environment Configuration**

Create a `.env` file with the following variables:

```env
# Database
MONGO_URI=your_mongodb_atlas_connection_string

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_32_characters_minimum
JWT_EXPIRE=30d

# Email Service (Gmail recommended)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_SUCCESS_URL=http://localhost:3000/payment/success
FRONTEND_CANCEL_URL=http://localhost:3000/payment/cancel

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4️⃣ **Launch**

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Validate configuration
curl http://localhost:5000/health
```

---

## 📊 **Monitoring & Health**

### **Health Check Endpoint**

```bash
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "uptime": 3600.123,
    "version": "1.0.0",
    "environment": "production",
    "memory": {
      "used": "45MB",
      "total": "128MB"
    }
  }
}
```

### **Logging System**

- **File Logging**: Daily rotation with 30-day retention
- **Request Logging**: HTTP requests with response times
- **Error Tracking**: Uncaught exceptions and promise rejections
- **Performance Metrics**: Database queries and API response times

Log files location: `./logs/`

- `app-YYYY-MM-DD.log` - General application logs
- `error-YYYY-MM-DD.log` - Error logs only

---

## 🔒 **Security Features**

### **Multi-Layer Protection**

- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All endpoints validated with express-validator
- **Data Sanitization**: MongoDB injection and XSS prevention
- **Security Headers**: CORS, CSP, and other security headers
- **Environment Validation**: Prevents startup with insecure configuration

### **Authentication Security**

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Email Verification**: Required before account activation
- **Password Reset**: Time-limited secure tokens

---

## 📱 **Frontend Integration**

### **Standardized API Responses**

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  },
  "timestamp": "2025-09-21T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2025-09-21T10:30:00.000Z"
}
```

**Paginated Response:**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    /* array of items */
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "timestamp": "2025-09-21T10:30:00.000Z"
}
```

### **Authentication Flow**

1. Register user: `POST /api/auth/register`
2. Verify email via link sent to user
3. Login: `POST /api/auth/login` → Receive JWT token
4. Use token in Authorization header: `Bearer <token>`

---

### **Environment Validation**

The server validates all required environment variables on startup and provides clear error messages for missing or invalid configuration.

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Follow conventional commit messages

---

## 📞 **Support & Community**

- **GitHub Issues**: [Report bugs or request features](https://github.com/faizan-ahmad5/e-dukaan-backend/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/faizan-ahmad5/e-dukaan-backend/discussions)
- **Email**: [faizan.ahmad.dev@gmail.com](mailto:fa3n20004@gmail.com)

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🚀 Built with ❤️ for the developer community</h3>
  <p>Star ⭐ this repository if you found it helpful!</p>
  
  **[⬆ Back to top](#e-dukaan-enterprise-e-commerce-backend-api)**
</div>



