import request from "supertest";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import productRoutes from "../../routes/productRoutes.mjs";
import { protect, isAdmin } from "../../middleware/authMiddleware.mjs";
import { Product } from "../../models/ProductSchema.mjs";
import { User } from "../../models/UserSchema.mjs";

// Create express app for testing
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/products", productRoutes);

// Mock error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

describe("Product Routes - Integration Tests", () => {
  let testUser, adminUser, userToken, adminToken;

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create test users
    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      isVerified: true,
      isAdmin: false,
    });

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      isVerified: true,
      isAdmin: true,
    });

    // Generate tokens
    userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    beforeEach(async () => {
      // Create sample products
      await Product.create([
        {
          title: "Gaming Laptop",
          description: "High-performance gaming laptop",
          price: 1299.99,
          category: "Electronics",
          brand: "TechBrand",
          inventory: { inStock: true, quantity: 5 },
        },
        {
          title: "Wireless Mouse",
          description: "Ergonomic wireless mouse",
          price: 29.99,
          category: "Electronics",
          brand: "AccessoryBrand",
          inventory: { inStock: true, quantity: 20 },
        },
        {
          title: "Coffee Mug",
          description: "Ceramic coffee mug",
          price: 12.99,
          category: "Home",
          brand: "HomeBrand",
          inventory: { inStock: false, quantity: 0 },
        },
      ]);
    });

    it("should return all products with pagination", async () => {
      const response = await request(app).get("/api/products").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            price: expect.any(Number),
            category: expect.any(String),
          }),
        ]),
        pagination: {
          currentPage: 1,
          totalPages: expect.any(Number),
          totalItems: 3,
        },
      });

      expect(response.body.data).toHaveLength(3);
    });

    it("should filter products by category", async () => {
      const response = await request(app)
        .get("/api/products?category=Electronics")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every(
          (product) => product.category === "Electronics"
        )
      ).toBe(true);
    });

    it("should filter products by price range", async () => {
      const response = await request(app)
        .get("/api/products?minPrice=20&maxPrice=50")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Wireless Mouse");
    });

    it("should search products by title", async () => {
      const response = await request(app)
        .get("/api/products?search=laptop")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain("Laptop");
    });

    it("should return paginated results", async () => {
      const response = await request(app)
        .get("/api/products?page=1&limit=2")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 2,
        totalItems: 3,
      });
    });

    it("should sort products by price ascending", async () => {
      const response = await request(app)
        .get("/api/products?sortBy=price&sortOrder=asc")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].price).toBeLessThanOrEqual(
        response.body.data[1].price
      );
    });

    it("should filter in-stock products only", async () => {
      const response = await request(app)
        .get("/api/products?inStock=true")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every(
          (product) => product.inventory.inStock === true
        )
      ).toBe(true);
    });
  });

  describe("GET /api/products/:id", () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        title: "Test Product",
        description: "Test description",
        price: 99.99,
        category: "Electronics",
        brand: "TestBrand",
        inventory: { inStock: true, quantity: 10 },
      });
    });

    it("should return single product by valid ID", async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          _id: testProduct._id.toString(),
          title: testProduct.title,
          description: testProduct.description,
          price: testProduct.price,
          category: testProduct.category,
          brand: testProduct.brand,
        },
      });
    });

    it("should return 400 for invalid product ID format", async () => {
      const response = await request(app)
        .get("/api/products/invalid-id")
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid product ID format",
      });
    });

    it("should return 404 for non-existent product ID", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/products/${nonExistentId}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: "Product not found",
      });
    });
  });

  describe("POST /api/products (Admin only)", () => {
    const newProductData = {
      title: "New Test Product",
      description: "New test description",
      price: 149.99,
      category: "Electronics",
      brand: "NewBrand",
      inventory: { inStock: true, quantity: 15 },
    };

    it("should create product with valid admin token", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProductData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: "Product created successfully",
        data: expect.objectContaining({
          title: newProductData.title,
          price: newProductData.price,
          category: newProductData.category,
        }),
      });

      // Verify product was created in database
      const createdProduct = await Product.findOne({
        title: newProductData.title,
      });
      expect(createdProduct).toBeTruthy();
    });

    it("should return 401 for request without token", async () => {
      const response = await request(app)
        .post("/api/products")
        .send(newProductData)
        .expect(401);

      expect(response.body).toMatchObject({
        message: "Not authorized, no token",
      });
    });

    it("should return 401 for non-admin user", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newProductData)
        .expect(401);

      expect(response.body).toMatchObject({
        message: "Not authorized as an admin",
      });
    });

    it("should return validation error for missing required fields", async () => {
      const incompleteData = {
        title: "Incomplete Product",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(incompleteData)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: "Failed to create product",
      });
    });

    it("should handle product with images array", async () => {
      const productWithImages = {
        ...newProductData,
        image: "main-image.jpg",
        images: ["image1.jpg", "image2.jpg", "image3.jpg"],
      };

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productWithImages)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.image).toBe("main-image.jpg");
      expect(response.body.data.images).toEqual([
        "main-image.jpg",
        "image1.jpg",
        "image2.jpg",
        "image3.jpg",
      ]);
    });
  });

  describe("PUT /api/products/:id (Admin only)", () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        title: "Original Product",
        description: "Original description",
        price: 99.99,
        category: "Electronics",
        brand: "OriginalBrand",
        inventory: { inStock: true, quantity: 10 },
      });
    });

    it("should update product with valid admin token", async () => {
      const updateData = {
        title: "Updated Product",
        price: 129.99,
        description: "Updated description",
      };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Product updated successfully",
        data: expect.objectContaining({
          title: updateData.title,
          price: updateData.price,
          description: updateData.description,
        }),
      });

      // Verify product was updated in database
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.title).toBe(updateData.title);
      expect(updatedProduct.price).toBe(updateData.price);
    });

    it("should return 401 for non-admin user", async () => {
      const updateData = { title: "Updated Product" };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toMatchObject({
        message: "Not authorized as an admin",
      });
    });

    it("should return 400 for invalid product ID", async () => {
      const updateData = { title: "Updated Product" };

      const response = await request(app)
        .put("/api/products/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid product ID format",
      });
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const updateData = { title: "Updated Product" };

      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: "Product not found",
      });
    });
  });

  describe("DELETE /api/products/:id (Admin only)", () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        title: "Product to Delete",
        description: "Will be deleted",
        price: 99.99,
        category: "Electronics",
        brand: "DeleteBrand",
        inventory: { inStock: true, quantity: 10 },
      });
    });

    it("should delete product with valid admin token", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Product deleted successfully",
      });

      // Verify product was deleted from database
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it("should return 401 for non-admin user", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(401);

      expect(response.body).toMatchObject({
        message: "Not authorized as an admin",
      });

      // Verify product was not deleted
      const stillExistsProduct = await Product.findById(testProduct._id);
      expect(stillExistsProduct).toBeTruthy();
    });

    it("should return 400 for invalid product ID", async () => {
      const response = await request(app)
        .delete("/api/products/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid product ID format",
      });
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: "Product not found",
      });
    });

    it("should return 401 for request without token", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .expect(401);

      expect(response.body).toMatchObject({
        message: "Not authorized, no token",
      });
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle malformed JSON in request body", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .set("Content-Type", "application/json")
        .send("{ invalid json }")
        .expect(400);

      // Express should handle malformed JSON
      expect(response.text).toContain("json");
    });

    it("should handle very large request body", async () => {
      const largeDescription = "x".repeat(100000); // 100KB string
      const productData = {
        title: "Large Product",
        description: largeDescription,
        price: 99.99,
        category: "Electronics",
        brand: "TestBrand",
      };

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);

      // Should either succeed or fail gracefully
      expect([200, 201, 413, 500]).toContain(response.status);
    });

    it("should handle concurrent product creation", async () => {
      const productData = {
        title: "Concurrent Product",
        description: "Created concurrently",
        price: 99.99,
        category: "Electronics",
        brand: "ConcurrentBrand",
      };

      // Create multiple requests simultaneously
      const promises = Array(5)
        .fill()
        .map(() =>
          request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
              ...productData,
              title: `${productData.title} ${Math.random()}`,
            })
        );

      const responses = await Promise.allSettled(promises);

      // All requests should either succeed or fail gracefully
      responses.forEach((result) => {
        if (result.status === "fulfilled") {
          expect([200, 201, 400, 500]).toContain(result.value.status);
        }
      });
    });
  });
});
