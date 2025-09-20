# E-Dukaan: Secure E-Commerce Backend API

<div>
  <h3>🛒 E-Dukaan - Your Complete E-Commerce Solution</h3>
  <p>A robust, scalable e-commerce backend built with Node.js, Express, MongoDB Atlas, and JWT authentication</p>
</div>

---

## 🚀 Features

### 🔐 Authentication & Security

- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin/User)
- **Email verification system** with automated email sending
- **Password reset functionality** with secure token validation
- Rate limiting and request logging
- Input sanitization and XSS protection
- CORS and security headers (Helmet)
- Environment variable protection
- **Email configuration testing** endpoint

### 🛍️ E-Dukaan Core Features

- **Product Management**: CRUD operations, categories, inventory tracking, SEO fields
- **Shopping Cart**: Add/remove/update products, persistent cart, coupon support
- **Order Processing**: Complete order lifecycle, status tracking, order history
- **Wishlist**: Save favorite products for later
- **Reviews & Ratings**: Verified purchase reviews with moderation system
- **Payment Integration**: Secure Stripe checkout sessions
- **Image Upload System**: Multi-format image processing with optimization
- **User Profile Management**: Avatar uploads, address management, profile updates

### 📊 Advanced Features

- Product search and filtering with categories
- Multi-vendor support ready architecture
- Inventory management with low stock alerts
- Order status tracking and notifications
- Admin dashboard capabilities
- Comprehensive API validation
- **Email service integration** with Gmail/SMTP support
- **Image processing and optimization** with Sharp
- **Multi-format documentation** (API docs, guides)
- Multi-language support ready

### 📧 Email Features

- **Automated email verification** for new user registrations
- **Password reset emails** with secure token links
- **Welcome emails** for verified users
- **SMTP configuration** with multiple provider support (Gmail, Outlook, Custom)
- **Email testing endpoint** for configuration validation
- **Responsive HTML email templates** with modern design

---

## 🛠️ Tech Stack

| Technology             | Purpose                          |
| ---------------------- | -------------------------------- |
| **Node.js**            | Runtime environment (ES Modules) |
| **Express.js**         | Web framework                    |
| **MongoDB Atlas**      | Database (Mongoose ODM)          |
| **JWT**                | Authentication tokens            |
| **Stripe**             | Payment processing               |
| **Bcryptjs**           | Password hashing                 |
| **Nodemailer**         | Email service integration        |
| **Sharp**              | Image processing & optimization  |
| **Multer**             | File upload middleware           |
| **Helmet**             | Security headers                 |
| **Express-rate-limit** | Rate limiting                    |

---

## 📁 Database Schemas

### User Schema

```javascript
{
  name, email, password, phone, avatar, addresses[],
  isAdmin, isEmailVerified, emailVerificationToken, emailVerificationExpires,
  passwordResetToken, passwordResetExpires, lastLogin, accountStatus,
  preferences, createdAt, updatedAt
}
```

### Product Schema

```javascript
{
  title, description, images[], price, comparePrice, category,
  brand, sku, inventory: { inStock, quantity, lowStockThreshold },
  tags[], rating: { average, count }, seoFields, status,
  specifications: { weight, dimensions }, createdAt, updatedAt
}
```

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

---

## 📖 Additional Documentation

### 📋 Complete Guides Available:

- **[Complete API Documentation](docs/COMPLETE_API_DOCUMENTATION.md)** - Comprehensive API reference with examples
- **[Email Verification Guide](docs/EMAIL_VERIFICATION_GUIDE.md)** - Step-by-step email setup and troubleshooting
- **[Image Upload Guide](docs/IMAGE_UPLOAD_GUIDE.md)** - File upload implementation and best practices

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
