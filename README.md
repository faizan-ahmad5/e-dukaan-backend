# 🛒 E-Dukaan: Enterprise E-Commerce Backend API

<p align="center">
  <em>A robust, scalable, and secure e-commerce backend built with modern Node.js & MongoDB stack.</em>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-green.svg"></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-4.21-blue.svg"></a>
  <a href="https://www.mongodb.com/atlas"><img src="https://img.shields.io/badge/MongoDB-Atlas-green.svg"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</p>

---

## 🌟 Overview

E-Dukaan is an enterprise-grade **e-commerce backend API** designed for modern web applications. Built with Node.js and Express, it provides comprehensive functionality for online stores, marketplaces, and e-commerce platforms with **production-ready security, monitoring, and scalability features**.

### ✨ Key Highlights

- 🔒 **Enterprise Security**: Multi-layer security with rate limiting, input validation, and XSS protection  
- 📊 **Production Monitoring**: Logging, health checks, and performance metrics  
- 🚀 **High Performance**: Optimized database queries and scalable architecture  
- 📱 **Frontend Ready**: Standardized REST APIs for React, Vue, Angular, or mobile apps  
- 🌍 **Flexible Environments**: Dev/staging/production configs with validation  
- 📧 **Email Integration**: Verification, password reset, and marketing emails  



## 🚀 Quick Start

### Prerequisites
- Node.js 18+  
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

# Configure your environment variables in .env
# (MongoDB URI, JWT secret, email, Stripe keys, etc.)

# Setup categories (recommended)
npm run setup:categories

# Seed the database with sample data (optional)
npm run seed:database

# Start development server
npm run dev

# Or start in production mode
npm start
````

---

## 🏪 Core Features

### 🏷️ Dynamic Category Management

* Database-driven categories instead of fixed enums
* Hierarchical parent-child relationships
* SEO-friendly slugs
* Specialized endpoints for navigation menus
* Ultra-simple setup with Men, Women, Kids categories

### 🔐 Authentication & Authorization

* JWT-based auth
* Role-based access control (Admin, User)
* Email verification & password reset
* Rate limiting & brute-force protection

### 👥 User Management

* Registration & profile updates
* Secure password hashing (bcrypt)
* Role-based permissions

### 📦 Product Management

* CRUD operations
* Product search & filtering
* Inventory management
* Image upload & processing (Sharp)

### 🛒 Shopping Cart

* Add/remove items, manage quantities
* Persistent carts with price calculations

### 📝 Order Management

* Order creation, status updates, and history
* Invoice generation

### 💳 Payment Integration

* Stripe checkout & payment intents
* Refunds & webhook handling

### ⭐ Reviews & Ratings

* Review submission & moderation
* Rating aggregation

### ❤️ Wishlist

* Add/remove items
* Move wishlist items to cart
* Wishlist statistics

---

## 📊 API Documentation

### Base URLs

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
POST   /api/auth/register            # Register user
POST   /api/auth/login               # Login
GET    /api/auth/verify-email/:token # Email verification
POST   /api/auth/resend-verification # Resend verification email
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password/:token # Reset password
```

#### Products

```bash
GET    /api/products                 # List products
GET    /api/products/:id             # Get product by ID
POST   /api/products                 # Create product (Admin)
PUT    /api/products/:id             # Update product (Admin)
DELETE /api/products/:id             # Delete product (Admin)
```

#### Categories

```bash
GET    /api/categories               # All categories
GET    /api/categories/tree          # Category tree
GET    /api/categories/menu          # Menu categories
POST   /api/categories               # Create category (Admin)
PUT    /api/categories/:id           # Update category (Admin)
DELETE /api/categories/:id           # Delete category (Admin)
```

#### Cart & Orders

```bash
GET    /api/cart                     # Get user cart
POST   /api/cart                     # Add to cart
DELETE /api/cart/remove/:productId   # Remove item
DELETE /api/cart/clear               # Clear cart

POST   /api/orders                   # Create order
GET    /api/orders                   # Get orders
PUT    /api/orders/:id/status        # Update status (Admin)
```

#### Payments

```bash
POST   /api/payment                  # Stripe checkout
```

#### Users

```bash
GET    /api/users                    # All users (Admin)
GET    /api/users/profile/me         # Current profile
PUT    /api/users/profile            # Update profile
```

#### Reviews

```bash
POST   /api/reviews                  # New review
GET    /api/reviews/product/:id      # Reviews for product
```

#### Wishlist

```bash
GET    /api/wishlist                 # User wishlist
POST   /api/wishlist                 # Add to wishlist
DELETE /api/wishlist/remove/:id      # Remove product
```

---

## 🔒 Security Features

* JWT auth + role-based access
* Multi-tier rate limiting
* Express-validator + sanitization
* XSS & Mongo injection protection
* Helmet, CORS, secure headers
* Password hashing with bcrypt
* Email verification required
* Audit logging for sensitive actions

---

## 🌍 Environment Configuration

```bash
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/e-dukaan

# JWT
JWT_SECRET=your_super_secure_secret
JWT_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start dev server with nodemon
npm run dev:debug        # Start with debugger
npm start                # Start production server

# Database
npm run setup:categories # Create default categories
npm run seed:database    # Seed sample data
npm run reset:database   # Reset DB (dev only)
```

---

## 📁 Project Structure

```
e-dukaan-backend/
├── config/                 # Config files
├── controllers/            # Route logic
├── middleware/             # Auth & security
├── models/                 # Mongoose schemas
├── routes/                 # API routes
├── utils/                  # Helpers (logger, email, etc.)
├── scripts/                # Seed/reset scripts
├── uploads/                # Uploaded files
└── server.mjs              # App entry
```

---

## 📈 Performance & Monitoring

* Indexed DB queries
* Response compression
* `/health` endpoint
* Sentry integration ready
* Uptime monitoring support
* Order/user/revenue metrics

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch (`git checkout -b feature/new`)
3. Commit changes (`git commit -m "feat: new feature"`)
4. Push & open PR

**Code Style**

* Clean & readable
* Follow conventional commits

---

## 📞 Contact

**Developer:** Faizan Ahmad

* 📧 [fa3n20004@gmail.com](mailto:fa3n20004@gmail.com)
* 🐙 [@faizan-ahmad5](https://github.com/faizan-ahmad5)

---

## 📄 License

MIT © [Faizan Ahmad](https://github.com/faizan-ahmad5)

