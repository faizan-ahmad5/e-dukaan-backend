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
git clone https://github.com/faizan-ahmad5/jwt-auth-atlas-crud.git
cd jwt-auth-atlas-crud

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

## 🧪 **Testing & Development**

### **API Testing**

```bash
# Test email configuration
curl http://localhost:5000/api/auth/test-email

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"securePassword123"}'

# Test product listing
curl http://localhost:5000/api/products
```

### **Environment Validation**

The server validates all required environment variables on startup and provides clear error messages for missing or invalid configuration.

---

## 📚 **Documentation**

- **[API Documentation](http://localhost:5000/docs)** - Interactive API documentation endpoint
- **[Health Check](http://localhost:5000/health)** - System status and metrics
- **[Environment Setup](.env.example)** - Complete environment configuration guide

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
- **Email**: [faizan.ahmad.dev@gmail.com](mailto:faizan.ahmad.dev@gmail.com)

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🚀 Built with ❤️ for the developer community</h3>
  <p>Star ⭐ this repository if you found it helpful!</p>
  
  **[⬆ Back to top](#e-dukaan-enterprise-e-commerce-backend-api)**
</div>

### Order Schema

```javascript
{
  user, orderNumber, items[{ product, quantity, price, productSnapshot }],
  shippingAddress, billingAddress, paymentInfo, pricing,
  orderStatus, shippingInfo, statusHistory[], deliveredAt,
  createdAt, updatedAt
}
```

### Cart Schema

```javascript
{
  user,
    items[{ product, quantity, addedAt }],
    couponCode,
    discountAmount,
    totalAmount,
    createdAt,
    updatedAt;
}
```

### Review Schema

```javascript
{
  user, product, rating, title, comment, images[],
  status, helpful[], moderatorNote, createdAt, updatedAt
}
```

### Wishlist Schema

```javascript
{
  user, items[{ product, addedAt }], createdAt, updatedAt;
}
```

---

## 🚦 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/faizan-ahmad5/jwt-auth-atlas-crud.git
cd e-dukaan-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_SUCCESS_URL=http://localhost:3000/success
FRONTEND_CANCEL_URL=http://localhost:3000/cancel

# Server Configuration
NODE_ENV=development
PORT=5000
```

**📧 Email Setup (Gmail):**

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password for your application
3. Use the App Password (without spaces) in EMAIL_PASS
4. Update EMAIL_USER and EMAIL_FROM with your Gmail address

### 4. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start at `http://localhost:5000`

---

## 📚 API Documentation

### 🔐 Authentication Endpoints

```
POST /api/auth/register           - Register new user
POST /api/auth/login              - User login
GET  /api/auth/verify-email/:token - Verify email address
POST /api/auth/resend-verification - Resend verification email
POST /api/auth/forgot-password    - Request password reset
POST /api/auth/reset-password/:token - Reset password with token
GET  /api/auth/test-email         - Test email configuration
POST /api/auth/test-email         - Send test email
```

### 👥 User Management

```
GET    /api/users/           - List all users (admin)
GET    /api/users/:id        - Get user by ID (admin)
PUT    /api/users/:id        - Update user (admin)
DELETE /api/users/:id        - Delete user (admin)
GET    /api/users/profile/me - Get current user profile
PUT    /api/users/:id/avatar - Update user avatar
```

### 🛍️ Products

```
GET    /api/products/                - Get all products (public)
GET    /api/products/:id             - Get single product
POST   /api/products/                - Create product (admin)
PUT    /api/products/:id             - Update product (admin)
DELETE /api/products/:id             - Delete product (admin)
PUT    /api/products/:id/images      - Update product images (admin)
POST   /api/products/:id/images      - Add product image (admin)
DELETE /api/products/:id/images/:url - Remove product image (admin)
```

### 🛒 Shopping Cart (Protected)

```
GET    /api/cart/                    - Get user's cart
POST   /api/cart/add                 - Add product to cart
PUT    /api/cart/update              - Update cart item quantity
DELETE /api/cart/remove/:productId   - Remove product from cart
DELETE /api/cart/clear               - Clear entire cart
```

### 📦 Orders (Protected)

```
POST   /api/orders/            - Place new order
GET    /api/orders/my-orders   - Get user's orders
GET    /api/orders/            - Get all orders (admin)
GET    /api/orders/stats       - Get order statistics (admin)
GET    /api/orders/:id         - Get order details
PUT    /api/orders/:id/status  - Update order status (admin)
PUT    /api/orders/:id/cancel  - Cancel order (user)
```

### ❤️ Wishlist (Protected)

```
GET    /api/wishlist/                    - Get user's wishlist
POST   /api/wishlist/add                 - Add to wishlist
DELETE /api/wishlist/remove/:productId   - Remove from wishlist
DELETE /api/wishlist/clear               - Clear wishlist
POST   /api/wishlist/move-to-cart        - Move item to cart
GET    /api/wishlist/stats               - Get wishlist statistics
GET    /api/wishlist/check/:productId    - Check if product in wishlist
POST   /api/wishlist/check-multiple      - Check multiple products
```

### ⭐ Reviews (Protected)

```
POST   /api/reviews/                     - Add product review
GET    /api/reviews/my-reviews           - Get user's reviews
GET    /api/reviews/                     - Get all reviews (admin)
GET    /api/reviews/product/:productId   - Get product reviews (public)
PUT    /api/reviews/:id                  - Update review
DELETE /api/reviews/:id                  - Delete review
PUT    /api/reviews/:id/moderate         - Moderate review (admin)
POST   /api/reviews/:id/helpful          - Mark review helpful
```

### 🖼️ Image Upload (Protected)

```
POST   /api/images/upload/product        - Upload product images
POST   /api/images/upload/avatar         - Upload user avatar
POST   /api/images/upload/review         - Upload review images
DELETE /api/images/delete/:category/:filename - Delete image
GET    /api/images/info/:category/:filename   - Get image info
```

DELETE /api/reviews/:id - Delete review (admin)

```

### 💳 Payment

```

POST /api/payment/ - Create Stripe checkout session

```

---

## 🔒 Security Features

- **Environment Variables**: All sensitive data stored in `.env`
- **Rate Limiting**: Protection against DDoS and brute force attacks
- **Input Sanitization**: MongoDB injection and XSS prevention
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: HTTP security headers
- **JWT Tokens**: Secure user session management
- **Password Hashing**: Bcrypt with salt rounds

---

## 🏗️ Project Structure

```

├── config/ # Configuration files
│ ├── db.mjs # MongoDB connection setup
│ └── emailConfig.mjs # Email service configuration
├── controllers/ # Route handlers
│ ├── authController.mjs
│ ├── userController.mjs
│ ├── productController.mjs
│ ├── cartController.mjs
│ ├── orderController.mjs
│ ├── reviewController.mjs
│ ├── wishlistController.mjs
│ └── paymentController.mjs
├── docs/ # Documentation
│ ├── COMPLETE_API_DOCUMENTATION.md
│ ├── EMAIL_VERIFICATION_GUIDE.md
│ └── IMAGE_UPLOAD_GUIDE.md
├── middleware/ # Custom middleware
│ ├── authMiddleware.mjs
│ ├── errorMiddleware.mjs
│ └── securityMiddleware.mjs
├── models/ # Database schemas
│ ├── UserSchema.mjs
│ ├── ProductSchema.mjs
│ ├── CartSchema.mjs
│ ├── OrderSchema.mjs
│ ├── ReviewSchema.mjs
│ └── WishlistSchema.mjs
├── routes/ # API routes
│ ├── authRoutes.mjs
│ ├── userRoutes.mjs
│ ├── productRoutes.mjs
│ ├── cartRoutes.mjs
│ ├── orderRoutes.mjs
│ ├── reviewRoutes.mjs
│ ├── wishlistRoutes.mjs
│ ├── imageRoutes.mjs
│ └── paymentRoutes.mjs
├── uploads/ # File upload directories
│ ├── avatars/ # User profile pictures
│ ├── products/ # Product images
│ └── reviews/ # Review images
├── utils/ # Utility functions
│ ├── emailService.mjs # Email service integration
│ └── imageProcessor.mjs # Image processing utilities
├── .env.example # Environment template
├── .gitignore # Git ignore rules
├── server.mjs # Main server file
├── package.json # Dependencies and scripts
└── README.md # Project documentation

````

---

## 🚀 Deployment

### Environment Variables Required:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `EMAIL_HOST` - SMTP server host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP server port (usually 587)
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASS` - Email password or app password
- `EMAIL_FROM` - From email address
- `FRONTEND_URL` - Frontend application URL
- `FRONTEND_SUCCESS_URL` - Payment success redirect URL
- `FRONTEND_CANCEL_URL` - Payment cancel redirect URL
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

### 📧 Email Service Setup:

**Gmail Configuration:**
1. Enable 2-Step Verification
2. Generate App Password
3. Use App Password in EMAIL_PASS (remove spaces)

**Other Providers:**
- Outlook: smtp-mail.outlook.com (Port: 587)
- Yahoo: smtp.mail.yahoo.com (Port: 587)
- Custom SMTP: Your provider's settings

### 🧪 Testing Email Configuration:

```bash
# Test email service connection
GET /api/auth/test-email

# Send test email
POST /api/auth/test-email
{
  "sendTestEmail": true,
  "testEmail": "recipient@example.com"
}
````

### 🔧 Quick Setup Guides:

**Email Service Setup:**

1. Configure environment variables in `.env`
2. Test configuration: `GET /api/auth/test-email`
3. Send test email to verify functionality

**Image Upload Setup:**

1. Upload directories are auto-created on server start
2. Supported formats: JPEG, PNG, WebP
3. Automatic image optimization and resizing
4. Secure file validation and processing

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you have any questions or need help with setup, please open an issue on GitHub.
