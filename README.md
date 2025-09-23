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

````
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
│         MongoDB Atlas │ Stripe │ Email Services         │
└──────────────────────────────────────────────────────────
---

## 🚀 **Quick Start**

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/faizan-ahmad5/e-dukaan-backend.git
cd e-dukaan-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Edit .env file with your MongoDB URI, JWT secret, email settings, etc.

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev

# Or start in production mode
npm start
````

---

## 🏪 **Core Features**

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, User)
- Email verification system
- Password reset functionality
- Rate limiting and brute force protection

### 👥 User Management

- User registration and profile management
- Email verification workflow
- Secure password handling with bcrypt
- User roles and permissions

### 📦 Product Management

- CRUD operations for products
- Category and subcategory management
- Image upload and processing with Sharp
- Product search and filtering
- Inventory management

### 🛒 Shopping Cart

- Add/remove products from cart
- Quantity management
- Cart persistence
- Price calculations

### 📝 Order Management

- Order creation and tracking
- Order status updates
- Order history
- Invoice generation

### 💳 Payment Integration

- Stripe payment processing
- Payment intent creation
- Webhook handling for payment events
- Refund management

### ⭐ Reviews & Ratings

- Product reviews and ratings
- Review moderation
- Rating aggregation

### ❤️ Wishlist

- Add/remove products to/from wishlist
- Wishlist management
- Share wishlist functionality

---

## 📊 **API Documentation**

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Core Endpoints

#### System

```bash
GET    /                            # API welcome message
GET    /health                      # Health check endpoint
GET    /docs                        # API documentation
```

#### Authentication

```bash
POST /api/auth/register              # User registration
POST /api/auth/login                 # User login
GET  /api/auth/verify-email/:token   # Email verification
POST /api/auth/resend-verification   # Resend verification email
POST /api/auth/forgot-password       # Password reset request
POST /api/auth/reset-password/:token # Password reset
GET  /api/auth/test-email           # Test email configuration
```

#### Products

```bash
GET    /api/products                    # Get all products
GET    /api/products/:id                # Get product by ID
POST   /api/products                    # Create product (Admin)
PUT    /api/products/:id                # Update product (Admin)
DELETE /api/products/:id                # Delete product (Admin)
PUT    /api/products/:id/images         # Update product images (Admin)
POST   /api/products/:id/images         # Add product image (Admin)
DELETE /api/products/:id/images/:imageUrl # Remove product image (Admin)
```

#### Cart & Orders

```bash
GET    /api/cart                    # Get user cart
POST   /api/cart                    # Add to cart
POST   /api/cart/add               # Alternative add to cart
PUT    /api/cart                    # Update cart
DELETE /api/cart/remove/:productId  # Remove from cart
DELETE /api/cart/clear              # Clear cart
POST   /api/orders                  # Create order
GET    /api/orders                  # Get user orders (or all for admin)
GET    /api/orders/my-orders        # Get user's orders
GET    /api/orders/stats            # Get order statistics (Admin)
GET    /api/orders/:id              # Get order by ID
PUT    /api/orders/:id/status       # Update order status (Admin)
PUT    /api/orders/:id/cancel       # Cancel order
```

#### Payments

```bash
POST   /api/payment                 # Create Stripe checkout session
```

#### Users

```bash
GET    /api/users                   # Get all users (Admin)
GET    /api/users/profile/me        # Get current user profile
PUT    /api/users/profile           # Update user profile
GET    /api/users/:id               # Get user by ID (Admin)
PUT    /api/users/:id               # Update user by ID (Admin)
DELETE /api/users/:id               # Delete user by ID (Admin)
```

#### Reviews

```bash
POST   /api/reviews                 # Create new review
GET    /api/reviews                 # Get all reviews (Admin)
GET    /api/reviews/my-reviews      # Get user's reviews
GET    /api/reviews/product/:productId # Get reviews for product
PUT    /api/reviews/:id             # Update review
DELETE /api/reviews/:id             # Delete review (Admin)
POST   /api/reviews/:id/moderate    # Moderate review (Admin)
POST   /api/reviews/:id/helpful     # Mark review as helpful
```

#### Wishlist

```bash
GET    /api/wishlist                # Get user's wishlist
POST   /api/wishlist                # Add to wishlist
POST   /api/wishlist/add            # Alternative add to wishlist
DELETE /api/wishlist/remove/:productId # Remove from wishlist
DELETE /api/wishlist/clear          # Clear wishlist
POST   /api/wishlist/move-to-cart/:productId # Move to cart
GET    /api/wishlist/stats          # Get wishlist statistics
GET    /api/wishlist/check/:productId # Check if product in wishlist
POST   /api/wishlist/check-multiple # Check multiple products
```

#### Images

```bash
POST   /api/images/upload/product   # Upload product image
POST   /api/images/upload/avatar    # Upload user avatar
POST   /api/images/upload/review    # Upload review image
DELETE /api/images/:type/:filename  # Delete uploaded image
```

---

## 🔒 **Security Features**

### Multi-Layer Security

- **Authentication**: JWT tokens with secure secrets
- **Authorization**: Role-based access control
- **Rate Limiting**: Multiple tiers (5-1000 requests/15min)
- **Input Validation**: Express-validator + custom validation
- **Data Sanitization**: MongoDB injection prevention
- **XSS Protection**: HTML sanitization
- **CORS**: Configured allowed origins
- **Helmet**: Security headers
- **Password Security**: bcrypt with salt rounds

### Security Best Practices

- Environment variable validation
- Secure session management
- Password complexity requirements
- Account lockout on failed attempts
- Email verification required
- Audit logging for sensitive operations

---

## 🌍 **Environment Configuration**

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/e_dukaan_dev

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=fa3n20004@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=fa3n20004@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Environment Validation

The application validates all required environment variables on startup and provides helpful error messages for missing or invalid configurations.

---

## 🚀 **Deployment**

### Deployment Options

1. **Render** (Recommended for beginners)

   - Easy setup with GitHub integration
   - Free tier available
   - Auto-scaling

2. **Railway** (Developer-friendly)

   - Git-based deployment
   - Good free tier
   - Simple environment management

3. **AWS ECS** (Enterprise)
   - Maximum scalability
   - Full control
   - Advanced monitoring

### Quick Deploy to Render

1. Fork this repository
2. Connect to Render
3. Set environment variables
4. Deploy automatically

---

## 📈 **Performance & Monitoring**

### Performance Optimizations

- Database query optimization with indexes
- Middleware efficiency
- Response compression
- Image optimization with Sharp

### Monitoring Setup

- **Health Checks**: `/health` endpoint with database validation
- **Error Tracking**: Sentry integration ready
- **Uptime Monitoring**: UptimeRobot configuration
- **Performance Metrics**: Response time tracking
- **Business Metrics**: Order, user, and revenue tracking

---

## 📋 **Available Scripts**

```bash
# Development
npm run dev              # Start development server with nodemon
npm run dev:debug        # Start with debugging enabled
npm start                # Production server start

# Database
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database (non-production)
```

---

## 📁 **Project Structure**

```
e-dukaan-backend/
├── config/                 # Configuration files
│   ├── db.mjs              # Database connection
│   ├── environment.mjs     # Environment validation
│   └── emailConfig.mjs     # Email service config
├── controllers/            # Route controllers
│   ├── authController.mjs  # Authentication logic
│   ├── productController.mjs
│   ├── orderController.mjs
│   └── ...
├── middleware/             # Express middleware
│   ├── authMiddleware.mjs  # JWT authentication
│   ├── errorMiddleware.mjs # Error handling
│   └── securityMiddleware.mjs
├── models/                 # Mongoose schemas
│   ├── UserSchema.mjs
│   ├── ProductSchema.mjs
│   └── ...
├── routes/                 # API routes
│   ├── authRoutes.mjs
│   ├── productRoutes.mjs
│   └── ...
├── utils/                  # Utility functions
│   ├── logger.mjs          # Winston logger
│   ├── emailService.mjs    # Email utilities
│   └── apiHelpers.mjs      # API response helpers
├── scripts/                # Database scripts
├── uploads/                # File upload directories
└── server.mjs              # Application entry point
```

---

## 🤝 **Contributing**

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards

- Write clean, readable code
- Update documentation as needed
- Follow conventional commit messages

---

## 📞 **Support & Contact**

### Developer

**Faizan Ahmad**

- Email: [fa3n20004@gmail.com](mailto:fa3n20004@gmail.com)
- GitHub: [@faizan-ahmad5](https://github.com/faizan-ahmad5)

### Issues & Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/faizan-ahmad5/e-dukaan-backend/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/faizan-ahmad5/e-dukaan-backend/discussions)
- 📧 **Email Support**: fa3n20004@gmail.com

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 **Roadmap**

### Current Version (v1.0.0)

- ✅ Core e-commerce functionality
- ✅ Authentication & authorization
- ✅ Payment processing with Stripe
- ✅ Email notifications
- ✅ Production deployment ready

<div align="center">
  <h3>🚀 Ready to build amazing e-commerce experiences?</h3>
  <p>
    <a href="https://github.com/faizan-ahmad5/e-dukaan-backend/fork">Fork this repo</a> and start building today!
  </p>
  
</div>
