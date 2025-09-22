import { test, expect } from "@playwright/test";

/**
 * E2E Performance and Load Tests
 *
 * Tests system performance under various conditions:
 * - Response time benchmarks
 * - Concurrent user scenarios
 * - Database query performance
 * - Rate limiting effectiveness
 * - Memory and resource usage
 */

test.describe("Performance Benchmarks", () => {
  let userToken;

  test.beforeAll(async ({ request }) => {
    // Create user for authenticated requests
    const timestamp = Date.now();
    const response = await request.post("/api/auth/register", {
      data: {
        name: "Performance Test User",
        email: `perf_user_${timestamp}@example.com`,
        password: "PerfTest123!",
      },
    });
    const data = await response.json();
    userToken = data.data.token;
  });

  test("Health check response time", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get("/health");
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(100); // Should respond within 100ms

    console.log(`Health check response time: ${responseTime}ms`);
  });

  test("Authentication response time", async ({ request }) => {
    const loginData = {
      email: "perf_user_" + Date.now() + "@example.com",
      password: "PerfTest123!",
    };

    // Register first
    await request.post("/api/auth/register", {
      data: {
        name: "Login Perf User",
        ...loginData,
      },
    });

    const startTime = Date.now();
    const response = await request.post("/api/auth/login", {
      data: loginData,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(500); // Should authenticate within 500ms

    console.log(`Authentication response time: ${responseTime}ms`);
  });

  test("Product listing response time", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get("/api/products?limit=20");
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(300); // Should load products within 300ms

    console.log(`Product listing response time: ${responseTime}ms`);
  });

  test("Product search response time", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(
      "/api/products?search=test&category=Electronics"
    );
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(400); // Should search within 400ms

    console.log(`Product search response time: ${responseTime}ms`);
  });

  test("User profile access response time", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(200); // Should access profile within 200ms

    console.log(`Profile access response time: ${responseTime}ms`);
  });

  test("Cart operations response time", async ({ request }) => {
    // Get a product first
    const productsResponse = await request.get("/api/products?limit=1");
    const productsData = await productsResponse.json();

    if (productsData.data && productsData.data.length > 0) {
      const productId = productsData.data[0]._id;

      const startTime = Date.now();
      const response = await request.post("/api/cart", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        data: {
          productId: productId,
          quantity: 1,
        },
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(300); // Should add to cart within 300ms

      console.log(`Add to cart response time: ${responseTime}ms`);
    }
  });
});

test.describe("Concurrent User Load Tests", () => {
  test("Handle multiple simultaneous registrations", async ({ request }) => {
    const timestamp = Date.now();
    const concurrentRequests = 10;

    const registrationPromises = Array.from(
      { length: concurrentRequests },
      (_, index) =>
        request.post("/api/auth/register", {
          data: {
            name: `Concurrent User ${index}`,
            email: `concurrent_user_${timestamp}_${index}@example.com`,
            password: "ConcurrentTest123!",
          },
        })
    );

    const startTime = Date.now();
    const responses = await Promise.all(registrationPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Check that most requests succeeded
    const successfulRegistrations = responses.filter((response) =>
      response.ok()
    );
    expect(successfulRegistrations.length).toBeGreaterThan(
      concurrentRequests * 0.8
    ); // At least 80% success rate

    console.log(
      `${concurrentRequests} concurrent registrations completed in ${totalTime}ms`
    );
    console.log(
      `Success rate: ${successfulRegistrations.length}/${concurrentRequests}`
    );
  });

  test("Handle multiple simultaneous product searches", async ({ request }) => {
    const concurrentRequests = 15;
    const searchTerms = ["test", "electronics", "book", "laptop", "phone"];

    const searchPromises = Array.from(
      { length: concurrentRequests },
      (_, index) =>
        request.get(
          `/api/products?search=${searchTerms[index % searchTerms.length]}`
        )
    );

    const startTime = Date.now();
    const responses = await Promise.all(searchPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // All requests should succeed
    const successfulSearches = responses.filter((response) => response.ok());
    expect(successfulSearches.length).toBe(concurrentRequests);

    // Average response time should be reasonable
    const averageTime = totalTime / concurrentRequests;
    expect(averageTime).toBeLessThan(500); // Average under 500ms per request

    console.log(
      `${concurrentRequests} concurrent searches completed in ${totalTime}ms`
    );
    console.log(`Average response time: ${averageTime}ms`);
  });

  test("Handle multiple users accessing same product", async ({ request }) => {
    // Get a product ID first
    const productsResponse = await request.get("/api/products?limit=1");
    const productsData = await productsResponse.json();

    if (productsData.data && productsData.data.length > 0) {
      const productId = productsData.data[0]._id;
      const concurrentRequests = 20;

      const productAccessPromises = Array.from(
        { length: concurrentRequests },
        () => request.get(`/api/products/${productId}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(productAccessPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      const successfulRequests = responses.filter((response) => response.ok());
      expect(successfulRequests.length).toBe(concurrentRequests);

      console.log(
        `${concurrentRequests} concurrent product accesses completed in ${totalTime}ms`
      );
    }
  });
});

test.describe("Rate Limiting Tests", () => {
  test("Authentication endpoint rate limiting", async ({ request }) => {
    const loginData = {
      email: "rate_limit_test@example.com",
      password: "WrongPassword123!",
    };

    // Make rapid requests to trigger rate limiting
    const rapidRequests = 10;
    const promises = Array.from({ length: rapidRequests }, () =>
      request.post("/api/auth/login", { data: loginData })
    );

    const responses = await Promise.all(promises);

    // Some requests should be rate limited (429 status)
    const rateLimitedResponses = responses.filter(
      (response) => response.status() === 429
    );
    const failedAuthResponses = responses.filter(
      (response) => response.status() === 401
    );

    expect(rateLimitedResponses.length + failedAuthResponses.length).toBe(
      rapidRequests
    );
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    console.log(
      `Rate limiting triggered: ${rateLimitedResponses.length}/${rapidRequests} requests blocked`
    );
  });

  test("General API rate limiting", async ({ request }) => {
    // Make rapid requests to a general endpoint
    const rapidRequests = 50;
    const promises = Array.from({ length: rapidRequests }, () =>
      request.get("/api/products")
    );

    const responses = await Promise.all(promises);

    // Check if rate limiting was applied
    const rateLimitedResponses = responses.filter(
      (response) => response.status() === 429
    );
    const successfulResponses = responses.filter((response) => response.ok());

    // Should handle most requests but may rate limit some
    expect(successfulResponses.length + rateLimitedResponses.length).toBe(
      rapidRequests
    );

    console.log(
      `API rate limiting: ${rateLimitedResponses.length}/${rapidRequests} requests rate limited`
    );
  });
});

test.describe("Database Performance Tests", () => {
  test("Large dataset pagination performance", async ({ request }) => {
    // Test pagination with different page sizes
    const pageSizes = [10, 25, 50, 100];

    for (const limit of pageSizes) {
      const startTime = Date.now();
      const response = await request.get(`/api/products?limit=${limit}&page=1`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(limit);

      // Response time should not increase significantly with page size
      expect(responseTime).toBeLessThan(500);

      console.log(`Pagination (limit=${limit}): ${responseTime}ms`);
    }
  });

  test("Search performance with different query types", async ({ request }) => {
    const searchQueries = [
      "test", // Simple text search
      "e2e test", // Multi-word search
      "laptop computer", // Related terms
      "electronics", // Category search
      "test product", // Partial match
    ];

    for (const query of searchQueries) {
      const startTime = Date.now();
      const response = await request.get(
        `/api/products?search=${encodeURIComponent(query)}`
      );
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(400);

      console.log(`Search "${query}": ${responseTime}ms`);
    }
  });

  test("Complex filtering performance", async ({ request }) => {
    // Test complex product filtering
    const filterParams = [
      "category=Electronics&minPrice=100&maxPrice=1000",
      "tags=test&sort=-price&limit=20",
      "isActive=true&category=Electronics&sort=createdAt",
      "search=test&category=Electronics&minPrice=50",
    ];

    for (const params of filterParams) {
      const startTime = Date.now();
      const response = await request.get(`/api/products?${params}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(600);

      console.log(`Complex filter "${params}": ${responseTime}ms`);
    }
  });
});

test.describe("Memory and Resource Tests", () => {
  test("Handle large product list requests", async ({ request }) => {
    // Request large amounts of data
    const response = await request.get("/api/products?limit=100");

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data.data)).toBeTruthy();

    // Response should include proper pagination even for large requests
    expect(data).toHaveProperty("pagination");
    expect(data.pagination).toHaveProperty("totalItems");
    expect(data.pagination).toHaveProperty("totalPages");
  });

  test("Handle multiple data-heavy operations", async ({ request }) => {
    // Create user for authenticated requests
    const timestamp = Date.now();
    const registerResponse = await request.post("/api/auth/register", {
      data: {
        name: "Heavy Operations User",
        email: `heavy_ops_${timestamp}@example.com`,
        password: "HeavyOps123!",
      },
    });

    if (registerResponse.ok()) {
      const userData = await registerResponse.json();
      const token = userData.data.token;

      // Perform multiple data-heavy operations simultaneously
      const operations = [
        request.get("/api/products?limit=50"),
        request.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        request.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        request.get("/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        request.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ];

      const startTime = Date.now();
      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Most operations should succeed
      const successfulOps = responses.filter((response) => response.ok());
      expect(successfulOps.length).toBeGreaterThan(operations.length * 0.8);

      console.log(
        `${operations.length} heavy operations completed in ${totalTime}ms`
      );
    }
  });
});

test.describe("Error Rate and Resilience Tests", () => {
  test("System resilience under invalid requests", async ({ request }) => {
    // Send various invalid requests
    const invalidRequests = [
      // Invalid JSON
      request.post("/api/auth/register", {
        data: '{"invalid": json}',
        headers: { "Content-Type": "application/json" },
      }),
      // Invalid endpoints
      request.get("/api/nonexistent"),
      // Invalid parameters
      request.get("/api/products?page=-1&limit=0"),
      // Invalid IDs
      request.get("/api/products/invalid-id"),
      // Invalid content type
      request.post("/api/auth/login", {
        data: "plain text data",
        headers: { "Content-Type": "text/plain" },
      }),
    ];

    const responses = await Promise.all(invalidRequests);

    // All should return proper error responses (not crash)
    responses.forEach((response) => {
      expect([400, 404, 500]).toContain(response.status());
    });

    // System should remain responsive after invalid requests
    const healthCheck = await request.get("/health");
    expect(healthCheck.ok()).toBeTruthy();
  });

  test("Measure error response consistency", async ({ request }) => {
    // Test that errors are returned in consistent format
    const errorRequests = [
      request.get("/api/products/507f1f77bcf86cd799439011"), // Non-existent ID
      request.post("/api/auth/login", { data: { email: "invalid" } }), // Invalid data
      request.get("/api/users/profile"), // Missing auth
    ];

    const responses = await Promise.all(errorRequests);

    for (const response of responses) {
      if (!response.ok()) {
        const data = await response.json();

        // All errors should have consistent structure
        expect(data).toHaveProperty("success", false);
        expect(data).toHaveProperty("message");
        expect(typeof data.message).toBe("string");

        // Should not expose sensitive information
        expect(data.message).not.toContain("stack");
        expect(data.message).not.toContain("database");
      }
    }
  });
});
