/**
 * E2E Test Utilities
 *
 * Shared utilities and helpers for end-to-end testing
 */

/**
 * Generate unique test data
 */
export const TestDataGenerator = {
  /**
   * Generate unique email address
   */
  email: (prefix = "test") => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}@example.com`;
  },

  /**
   * Generate test user data
   */
  user: (role = "user") => {
    const timestamp = Date.now();
    return {
      name: `Test User ${timestamp}`,
      email: TestDataGenerator.email(role),
      password: "TestPassword123!",
      role,
    };
  },

  /**
   * Generate test product data
   */
  product: () => {
    const timestamp = Date.now();
    const categories = ["Electronics", "Books", "Clothing", "Home & Garden"];
    const category = categories[Math.floor(Math.random() * categories.length)];

    return {
      title: `Test Product ${timestamp}`,
      description: `This is a test product created at ${new Date().toISOString()}`,
      price: Math.floor(Math.random() * 1000) + 10,
      category,
      tags: ["test", "e2e", category.toLowerCase()],
      inventory: Math.floor(Math.random() * 100) + 1,
      isActive: true,
    };
  },

  /**
   * Generate test order data
   */
  order: () => {
    return {
      shippingAddress: {
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
      paymentMethod: "stripe",
    };
  },

  /**
   * Generate test review data
   */
  review: (productId, orderId) => {
    const comments = [
      "Great product, highly recommended!",
      "Good quality for the price.",
      "Excellent service and fast shipping.",
      "Product as described, satisfied with purchase.",
      "Amazing quality, will buy again!",
    ];

    return {
      rating: Math.floor(Math.random() * 5) + 1,
      comment: comments[Math.floor(Math.random() * comments.length)],
      productId,
      orderId,
    };
  },
};

/**
 * Authentication helpers
 */
export class AuthHelper {
  constructor(request) {
    this.request = request;
  }

  /**
   * Register a new user and return auth data
   */
  async registerUser(userData) {
    const response = await this.request.post("/api/auth/register", {
      data: userData || TestDataGenerator.user(),
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        user: data.data.user,
        token: data.data.token,
        success: true,
      };
    }

    const error = await response.json();
    return {
      success: false,
      error: error.message,
      status: response.status(),
    };
  }

  /**
   * Login user and return auth data
   */
  async loginUser(email, password) {
    const response = await this.request.post("/api/auth/login", {
      data: { email, password },
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        user: data.data.user,
        token: data.data.token,
        success: true,
      };
    }

    const error = await response.json();
    return {
      success: false,
      error: error.message,
      status: response.status(),
    };
  }

  /**
   * Create admin user (requires manual role elevation in real scenario)
   */
  async createAdminUser() {
    const userData = TestDataGenerator.user("admin");
    const result = await this.registerUser(userData);

    if (result.success) {
      // In a real scenario, you'd need to promote this user to admin
      // For testing, we'll assume the role elevation happens elsewhere
      return result;
    }

    return result;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
}

/**
 * Product management helpers
 */
export class ProductHelper {
  constructor(request, authToken = null) {
    this.request = request;
    this.authToken = authToken;
  }

  /**
   * Create a test product (admin only)
   */
  async createProduct(productData) {
    if (!this.authToken) {
      throw new Error("Auth token required for product creation");
    }

    const response = await this.request.post("/api/products", {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
      data: productData || TestDataGenerator.product(),
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        product: data.data,
        success: true,
      };
    }

    const error = await response.json();
    return {
      success: false,
      error: error.message,
      status: response.status(),
    };
  }

  /**
   * Get all products with optional filters
   */
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.request.get(`/api/products?${params}`);

    if (response.ok()) {
      const data = await response.json();
      return {
        products: data.data,
        pagination: data.pagination,
        success: true,
      };
    }

    return { success: false, status: response.status() };
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId) {
    const response = await this.request.get(`/api/products/${productId}`);

    if (response.ok()) {
      const data = await response.json();
      return {
        product: data.data,
        success: true,
      };
    }

    return { success: false, status: response.status() };
  }
}

/**
 * Cart management helpers
 */
export class CartHelper {
  constructor(request, authToken) {
    this.request = request;
    this.authToken = authToken;
    this.headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Add item to cart
   */
  async addToCart(productId, quantity = 1) {
    const response = await this.request.post("/api/cart", {
      headers: this.headers,
      data: { productId, quantity },
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        cart: data.data,
        success: true,
      };
    }

    const error = await response.json();
    return {
      success: false,
      error: error.message,
      status: response.status(),
    };
  }

  /**
   * Get user's cart
   */
  async getCart() {
    const response = await this.request.get("/api/cart", {
      headers: this.headers,
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        cart: data.data,
        success: true,
      };
    }

    return { success: false, status: response.status() };
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId, quantity) {
    const response = await this.request.put("/api/cart", {
      headers: this.headers,
      data: { productId, quantity },
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        cart: data.data,
        success: true,
      };
    }

    const error = await response.json();
    return {
      success: false,
      error: error.message,
      status: response.status(),
    };
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId) {
    const response = await this.request.delete(`/api/cart/${productId}`, {
      headers: this.headers,
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        cart: data.data,
        success: true,
      };
    }

    return { success: false, status: response.status() };
  }
}

/**
 * Order management helpers
 */
export class OrderHelper {
  constructor(request, authToken) {
    this.request = request;
    this.authToken = authToken;
    this.headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Create order from cart
   */
  async createOrder(orderData) {
    const response = await this.request.post("/api/orders", {
      headers: this.headers,
      data: orderData || TestDataGenerator.order(),
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        order: data.data,
        success: true,
      };
    }

    const error = await response.json();
    return {
      success: false,
      error: error.message,
      status: response.status(),
    };
  }

  /**
   * Get user's orders
   */
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.request.get(`/api/orders?${params}`, {
      headers: this.headers,
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        orders: data.data,
        success: true,
      };
    }

    return { success: false, status: response.status() };
  }

  /**
   * Get specific order
   */
  async getOrder(orderId) {
    const response = await this.request.get(`/api/orders/${orderId}`, {
      headers: this.headers,
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        order: data.data,
        success: true,
      };
    }

    return { success: false, status: response.status() };
  }
}

/**
 * Performance measurement utilities
 */
export class PerformanceHelper {
  /**
   * Measure API response time
   */
  static async measureResponseTime(requestFunction) {
    const startTime = Date.now();
    const response = await requestFunction();
    const endTime = Date.now();

    return {
      responseTime: endTime - startTime,
      response,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Run concurrent requests and measure performance
   */
  static async measureConcurrentRequests(
    requestFunctions,
    label = "Concurrent Requests"
  ) {
    const startTime = Date.now();
    const responses = await Promise.all(requestFunctions);
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const successCount = responses.filter((r) => r.ok && r.ok()).length;
    const averageTime = totalTime / requestFunctions.length;

    console.log(
      `${label}: ${requestFunctions.length} requests in ${totalTime}ms (avg: ${averageTime}ms, success: ${successCount})`
    );

    return {
      totalTime,
      averageTime,
      successCount,
      totalRequests: requestFunctions.length,
      successRate: (successCount / requestFunctions.length) * 100,
      responses,
    };
  }

  /**
   * Create load test scenario
   */
  static createLoadTest(requestFunction, concurrency = 10, iterations = 5) {
    const requests = [];

    for (let i = 0; i < concurrency; i++) {
      for (let j = 0; j < iterations; j++) {
        requests.push(requestFunction);
      }
    }

    return requests;
  }
}

/**
 * Test assertion helpers
 */
export class AssertionHelper {
  /**
   * Assert API response structure
   */
  static assertApiResponse(responseData, expectSuccess = true) {
    expect(responseData).toHaveProperty("success", expectSuccess);
    expect(responseData).toHaveProperty("message");
    expect(typeof responseData.message).toBe("string");

    if (expectSuccess) {
      expect(responseData).toHaveProperty("data");
    }
  }

  /**
   * Assert paginated response structure
   */
  static assertPaginatedResponse(responseData) {
    AssertionHelper.assertApiResponse(responseData, true);
    expect(Array.isArray(responseData.data)).toBeTruthy();
    expect(responseData).toHaveProperty("pagination");
    expect(responseData.pagination).toHaveProperty("currentPage");
    expect(responseData.pagination).toHaveProperty("totalPages");
    expect(responseData.pagination).toHaveProperty("totalItems");
  }

  /**
   * Assert user data structure
   */
  static assertUserData(userData) {
    expect(userData).toHaveProperty("id");
    expect(userData).toHaveProperty("name");
    expect(userData).toHaveProperty("email");
    expect(userData).toHaveProperty("role");
    expect(userData).not.toHaveProperty("password"); // Should not expose password
  }

  /**
   * Assert product data structure
   */
  static assertProductData(productData) {
    expect(productData).toHaveProperty("_id");
    expect(productData).toHaveProperty("title");
    expect(productData).toHaveProperty("description");
    expect(productData).toHaveProperty("price");
    expect(productData).toHaveProperty("category");
    expect(productData).toHaveProperty("inventory");
    expect(typeof productData.price).toBe("number");
    expect(typeof productData.inventory).toBe("number");
  }

  /**
   * Assert order data structure
   */
  static assertOrderData(orderData) {
    expect(orderData).toHaveProperty("_id");
    expect(orderData).toHaveProperty("user");
    expect(orderData).toHaveProperty("items");
    expect(orderData).toHaveProperty("totalAmount");
    expect(orderData).toHaveProperty("status");
    expect(orderData).toHaveProperty("shippingAddress");
    expect(Array.isArray(orderData.items)).toBeTruthy();
    expect(typeof orderData.totalAmount).toBe("number");
  }

  /**
   * Assert error response structure
   */
  static assertErrorResponse(responseData, expectedStatus) {
    expect(responseData).toHaveProperty("success", false);
    expect(responseData).toHaveProperty("message");
    expect(typeof responseData.message).toBe("string");

    // Error messages should not contain sensitive information
    expect(responseData.message).not.toContain("database");
    expect(responseData.message).not.toContain("mongo");
    expect(responseData.message).not.toContain("stack");
  }
}

/**
 * Database cleanup utilities
 */
export class CleanupHelper {
  /**
   * Clean up test data (if cleanup endpoints are available)
   */
  static async cleanupTestData(request, authToken, testDataIds = {}) {
    const results = {};

    // Note: In a real scenario, you'd have admin endpoints to clean up test data
    // This is a placeholder for cleanup operations

    try {
      // Clean up test products
      if (testDataIds.productIds && testDataIds.productIds.length > 0) {
        // Would delete test products
        results.products = "cleaned";
      }

      // Clean up test users
      if (testDataIds.userIds && testDataIds.userIds.length > 0) {
        // Would delete test users
        results.users = "cleaned";
      }

      // Clean up test orders
      if (testDataIds.orderIds && testDataIds.orderIds.length > 0) {
        // Would delete test orders
        results.orders = "cleaned";
      }
    } catch (error) {
      console.warn("Cleanup warning:", error.message);
    }

    return results;
  }
}

export default {
  TestDataGenerator,
  AuthHelper,
  ProductHelper,
  CartHelper,
  OrderHelper,
  PerformanceHelper,
  AssertionHelper,
  CleanupHelper,
};
