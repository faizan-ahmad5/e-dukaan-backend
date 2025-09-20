# AtlasCommerce: Secure E-Commerce Backend API

<div align="center">
  <h3>A robust, scalable e-commerce backend built with Node.js, Express, MongoDB Atlas, and JWT authentication</h3>
</div>

---

## 🚀 Features

### 🔐 Authentication & Security

- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin/User)
- Rate limiting and request logging
- Input sanitization and XSS protection
- CORS and security headers (Helmet)
- Environment variable protection

### 🛍️ E-Commerce Core Features

- **Product Management**: CRUD operations, categories, inventory tracking, SEO fields
- **Shopping Cart**: Add/remove/update products, persistent cart, coupon support
- **Order Processing**: Complete order lifecycle, status tracking, order history
- **Wishlist**: Save favorite products for later
- **Reviews & Ratings**: Verified purchase reviews with moderation
- **Payment Integration**: Secure Stripe checkout sessions

### 📊 Advanced Features

- Product search and filtering
- Inventory management with low stock alerts
- Order status tracking and notifications
- Admin dashboard capabilities
- Comprehensive API validation

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
| **Helmet**             | Security headers                 |
| **Express-rate-limit** | Rate limiting                    |

---

## 📁 Database Schemas

### User Schema

```javascript
{
  name, email, password, phone, avatar, addresses[],
  isAdmin, isVerified, status, preferences, lastLogin
}
```

### Product Schema

```javascript
{
  title, description, images[], price, comparePrice, category,
  brand, sku, stock, tags[], rating, seoFields, status
}
```

### Order Schema

```javascript
{
  user, orderNumber, items[], shippingAddress, billingAddress,
  paymentInfo, pricing, orderStatus, shippingInfo, statusHistory[]
}
```

### Cart Schema

```javascript
{
  user,
    products[{ product, quantity, priceAtAdd }],
    couponCode,
    discountAmount,
    totalAmount;
}
```

---

## 🚦 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/faizan-ahmad5/jwt-auth-atlas-crud.git
cd jwt-auth-atlas-crud
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file based on `.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NODE_ENV=development
PORT=5000
```

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
POST /api/auth/register  - Register new user
POST /api/auth/login     - User login
```

### 👥 User Management (Admin Only)

```
GET    /api/users/       - List all users
GET    /api/users/:id    - Get user by ID
PUT    /api/users/:id    - Update user
DELETE /api/users/:id    - Delete user
```

### 🛍️ Products

```
GET    /api/products/        - Get all products (public)
GET    /api/products/:id     - Get single product
POST   /api/products/        - Create product (admin)
PUT    /api/products/:id     - Update product (admin)
DELETE /api/products/:id     - Delete product (admin)
```

### 🛒 Shopping Cart (Protected)

```
GET    /api/cart/                    - Get user's cart
POST   /api/cart/add                 - Add product to cart
DELETE /api/cart/remove/:productId   - Remove product from cart
DELETE /api/cart/clear               - Clear entire cart
```

### 📦 Orders (Protected)

```
POST   /api/orders/         - Place new order
GET    /api/orders/         - Get user's orders
GET    /api/orders/:id      - Get order details
PUT    /api/orders/:id      - Update order status (admin)
```

### ❤️ Wishlist (Protected)

```
GET    /api/wishlist/                 - Get user's wishlist
POST   /api/wishlist/add              - Add to wishlist
DELETE /api/wishlist/remove/:productId - Remove from wishlist
DELETE /api/wishlist/clear            - Clear wishlist
```

### ⭐ Reviews (Protected)

```
POST   /api/reviews/                  - Add product review
GET    /api/reviews/product/:productId - Get product reviews
DELETE /api/reviews/:id               - Delete review (admin)
```

### 💳 Payment

```
POST   /api/payment/        - Create Stripe checkout session
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
├── controllers/         # Route handlers
│   ├── authController.mjs
│   ├── userController.mjs
│   ├── productController.mjs
│   ├── cartController.mjs
│   └── paymentController.mjs
├── middleware/          # Custom middleware
│   ├── authMiddleware.mjs
│   ├── errorMiddleware.mjs
│   └── securityMiddleware.mjs
├── models/              # Database schemas
│   ├── UserSchema.mjs
│   ├── ProductSchema.mjs
│   ├── CartSchema.mjs
│   ├── OrderSchema.mjs
│   └── ReviewSchema.mjs
├── routes/              # API routes
│   ├── authRoutes.mjs
│   ├── userRoutes.mjs
│   ├── productRoutes.mjs
│   └── cartRoutes.mjs
├── config/              # Configuration files
│   └── db.mjs
├── .env.example         # Environment template
├── server.mjs           # Main server file
└── package.json         # Dependencies
```

---

## 🚀 Deployment

### Environment Variables Required:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

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
