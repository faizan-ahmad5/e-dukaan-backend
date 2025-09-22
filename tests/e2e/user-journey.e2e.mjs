import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Complete E-Commerce User Journey
 *
 * Tests the complete shopping experience including:
 * - User registration and login
 * - Product browsing and search
 * - Adding products to cart
 * - Checkout process
 * - Order management
 * - User profile management
 */

test.describe("Complete E-Commerce User Journey", () => {
  let userToken;
  let userEmail;
  let userPassword;
  let userId;
  let productId;
  let cartId;
  let orderId;

  test.beforeAll(async ({ request }) => {
    // Setup test user and products
    const timestamp = Date.now();
    userEmail = `journey_user_${timestamp}@example.com`;
    userPassword = "JourneyPassword123!";

    // Register user
    const registerResponse = await request.post("/api/auth/register", {
      data: {
        name: "Journey User",
        email: userEmail,
        password: userPassword,
      },
    });

    const registerData = await registerResponse.json();
    console.log(
      "User registration response:",
      JSON.stringify(registerData, null, 2)
    );

    // Login to get the token (registration doesn't return token)
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: userEmail,
        password: userPassword,
      },
    });

    const loginData = await loginResponse.json();
    console.log("User login response:", JSON.stringify(loginData, null, 2));
    console.log("Login response status:", loginResponse.status());
    userToken = loginData.data?.token;
    userId = loginData.data?._id;
  });

  test("Step 1: User Registration and Profile Setup", async ({ request }) => {
    // User is already registered in beforeAll, let's update their profile
    const profileData = {
      name: "Updated Journey User",
      phone: "+1234567890",
      bio: "E-commerce test user",
    };

    const response = await request.put("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: profileData,
    });

    console.log("Profile update response status:", response.status());
    const profileResponseData = await response.json();
    console.log(
      "Profile update response:",
      JSON.stringify(profileResponseData, null, 2)
    );

    expect(response.ok()).toBeTruthy();

    expect(profileResponseData).toHaveProperty("success", true);
    expect(profileResponseData.data).toHaveProperty("name", profileData.name);
  });

  test("Step 2: Browse Products and Categories", async ({ request }) => {
    // Get all products
    const allProductsResponse = await request.get("/api/products");
    console.log("All products response status:", allProductsResponse.status());
    const allProductsData = await allProductsResponse.json();
    console.log(
      "All products response:",
      JSON.stringify(allProductsData, null, 2)
    );

    expect(allProductsResponse.ok()).toBeTruthy();

    expect(allProductsData).toHaveProperty("success", true);
    expect(Array.isArray(allProductsData.data)).toBeTruthy();

    // Store a product ID for later use
    if (allProductsData.data.length > 0) {
      productId = allProductsData.data[0]._id;
    }

    // Test product search
    const searchResponse = await request.get("/api/products?search=test");
    expect(searchResponse.ok()).toBeTruthy();

    const searchData = await searchResponse.json();
    expect(searchData).toHaveProperty("success", true);

    // Test category filtering
    const categoryResponse = await request.get(
      "/api/products?category=Electronics"
    );
    expect(categoryResponse.ok()).toBeTruthy();

    const categoryData = await categoryResponse.json();
    expect(categoryData).toHaveProperty("success", true);

    // Test pagination
    const paginatedResponse = await request.get("/api/products?page=1&limit=5");
    expect(paginatedResponse.ok()).toBeTruthy();

    const paginatedData = await paginatedResponse.json();
    expect(paginatedData).toHaveProperty("pagination");
    expect(paginatedData.pagination).toHaveProperty("currentPage", 1);
  });

  test("Step 3: View Product Details", async ({ request }) => {
    if (!productId) {
      test.skip("No product available for testing");
    }

    const response = await request.get(`/api/products/${productId}`);
    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.data).toHaveProperty("_id", productId);
    expect(responseData.data).toHaveProperty("title");
    expect(responseData.data).toHaveProperty("price");
    expect(responseData.data).toHaveProperty("description");
  });

  test("Step 4: Add Products to Cart", async ({ request }) => {
    if (!productId) {
      test.skip("No product available for testing");
    }

    // Add product to cart
    const cartData = {
      productId: productId,
      quantity: 2,
    };

    const response = await request.post("/api/cart/add", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: cartData,
    });

    console.log("Add to cart response status:", response.status());
    const cartResponseData = await response.json();
    console.log(
      "Add to cart response:",
      JSON.stringify(cartResponseData, null, 2)
    );

    expect(response.ok()).toBeTruthy();

    expect(cartResponseData).toHaveProperty("success", true);
    expect(cartResponseData.data).toHaveProperty("user", userId);
    expect(cartResponseData.data).toHaveProperty("items");
    expect(cartResponseData.data.items.length).toBeGreaterThan(0);

    cartId = cartResponseData.data._id;
  });

  test("Step 5: Update Cart Quantities", async ({ request }) => {
    if (!cartId || !productId) {
      test.skip("No cart or product available for testing");
    }

    // Update cart item quantity
    const updateData = {
      productId: productId,
      quantity: 3,
    };

    const response = await request.put("/api/cart", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: updateData,
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);

    // Find the updated item
    const updatedItem = responseData.data.items.find(
      (item) => item.product._id === productId
    );
    expect(updatedItem).toBeDefined();
    expect(updatedItem.quantity).toBe(3);
  });

  test("Step 6: View Cart and Calculate Totals", async ({ request }) => {
    if (!userToken) {
      test.skip("No user token available");
    }

    const response = await request.get("/api/cart", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.data).toHaveProperty("items");
    expect(responseData.data).toHaveProperty("totalAmount");
    expect(typeof responseData.data.totalAmount).toBe("number");
    expect(responseData.data.totalAmount).toBeGreaterThan(0);
  });

  test("Step 7: Proceed to Checkout", async ({ request }) => {
    if (!userToken) {
      test.skip("No user token available");
    }

    // Create an order from cart
    const orderData = {
      shippingAddress: {
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
      paymentMethod: "stripe",
    };

    const response = await request.post("/api/orders", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: orderData,
    });

    console.log("Create order response status:", response.status());
    const orderResponseData = await response.json();
    console.log(
      "Create order response:",
      JSON.stringify(orderResponseData, null, 2)
    );

    expect(response.ok()).toBeTruthy();

    expect(orderResponseData).toHaveProperty("success", true);
    expect(orderResponseData.data).toHaveProperty("_id");
    expect(orderResponseData.data).toHaveProperty("user", userId);
    expect(orderResponseData.data).toHaveProperty("items");
    expect(orderResponseData.data).toHaveProperty("totalAmount");
    expect(orderResponseData.data).toHaveProperty("status", "pending");
    expect(orderResponseData.data).toHaveProperty("shippingAddress");

    orderId = orderResponseData.data._id;
  });

  test("Step 8: View Order History", async ({ request }) => {
    if (!userToken) {
      test.skip("No user token available");
    }

    const response = await request.get("/api/orders", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(Array.isArray(responseData.data)).toBeTruthy();
    expect(responseData.data.length).toBeGreaterThan(0);

    // Check if our order is in the list
    const ourOrder = responseData.data.find((order) => order._id === orderId);
    expect(ourOrder).toBeDefined();
  });

  test("Step 9: View Specific Order Details", async ({ request }) => {
    if (!orderId || !userToken) {
      test.skip("No order or user token available");
    }

    const response = await request.get(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.data).toHaveProperty("_id", orderId);
    expect(responseData.data).toHaveProperty("items");
    expect(responseData.data).toHaveProperty("totalAmount");
  });

  test("Step 10: Add Product to Wishlist", async ({ request }) => {
    if (!productId || !userToken) {
      test.skip("No product or user token available");
    }

    const wishlistData = {
      productId: productId,
    };

    const response = await request.post("/api/wishlist", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: wishlistData,
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.data).toHaveProperty("user", userId);
    expect(responseData.data).toHaveProperty("products");
  });

  test("Step 11: View Wishlist", async ({ request }) => {
    if (!userToken) {
      test.skip("No user token available");
    }

    const response = await request.get("/api/wishlist", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.data).toHaveProperty("products");
    expect(Array.isArray(responseData.data.products)).toBeTruthy();
  });

  test("Step 12: Write Product Review", async ({ request }) => {
    if (!productId || !userToken || !orderId) {
      test.skip("Missing required data for review");
    }

    const reviewData = {
      rating: 5,
      comment: "Excellent product! Great quality and fast shipping.",
      productId: productId,
      orderId: orderId,
    };

    const response = await request.post("/api/reviews", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: reviewData,
    });

    expect(response.ok()).toBeTruthy();

    const reviewResponseData = await response.json();
    expect(reviewResponseData).toHaveProperty("success", true);
    expect(reviewResponseData.data).toHaveProperty("rating", 5);
    expect(reviewResponseData.data).toHaveProperty(
      "comment",
      reviewData.comment
    );
    expect(reviewResponseData.data).toHaveProperty("user");
    expect(reviewResponseData.data).toHaveProperty("product", productId);
  });

  test("Step 13: View Product Reviews", async ({ request }) => {
    if (!productId) {
      test.skip("No product available for testing");
    }

    const response = await request.get(`/api/reviews/product/${productId}`);
    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(Array.isArray(responseData.data)).toBeTruthy();
  });

  test("Step 14: Update User Profile", async ({ request }) => {
    if (!userToken) {
      test.skip("No user token available");
    }

    const profileUpdate = {
      name: "Updated E-Commerce User",
      phone: "+9876543210",
    };

    const response = await request.put("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: profileUpdate,
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(responseData.data).toHaveProperty("name", profileUpdate.name);
    expect(responseData.data).toHaveProperty("phone", profileUpdate.phone);
  });

  test("Step 15: Search User's Order History", async ({ request }) => {
    if (!userToken) {
      test.skip("No user token available");
    }

    // Search orders with filters
    const response = await request.get("/api/orders?status=pending&limit=10", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", true);
    expect(Array.isArray(responseData.data)).toBeTruthy();
  });
});

test.describe("E-Commerce Error Scenarios", () => {
  let userToken;

  test.beforeAll(async ({ request }) => {
    const timestamp = Date.now();
    const email = `error_test_${timestamp}@example.com`;

    // Register user
    const registerResponse = await request.post("/api/auth/register", {
      data: {
        name: "Error Test User",
        email: email,
        password: "ErrorTest123!",
      },
    });

    expect(registerResponse.status()).toBe(201);

    // Login to get token
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: email,
        password: "ErrorTest123!",
      },
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    userToken = loginData.data.token;

    expect(userToken).toBeDefined();
  });

  test("should handle adding non-existent product to cart", async ({
    request,
  }) => {
    const cartData = {
      productId: "507f1f77bcf86cd799439011", // Valid ObjectId but non-existent
      quantity: 1,
    };

    const response = await request.post("/api/cart", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: cartData,
    });

    expect(response.status()).toBe(404);

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", false);
  });

  test("should handle invalid product ID format", async ({ request }) => {
    const cartData = {
      productId: "invalid-id",
      quantity: 1,
    };

    const response = await request.post("/api/cart", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: cartData,
    });

    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", false);
  });

  test("should handle order creation with invalid address", async ({
    request,
  }) => {
    const orderData = {
      shippingAddress: {
        street: "", // Empty street
        city: "Test City",
        state: "Test State",
        zipCode: "invalid", // Invalid zip
        country: "Test Country",
      },
      paymentMethod: "stripe",
    };

    const response = await request.post("/api/orders", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: orderData,
    });

    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", false);
  });

  test("should handle review without purchase", async ({ request }) => {
    const reviewData = {
      rating: 5,
      comment: "Great product!",
      productId: "507f1f77bcf86cd799439011",
      orderId: "507f1f77bcf86cd799439012",
    };

    const response = await request.post("/api/reviews", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      data: reviewData,
    });

    // Should fail because user hasn't purchased the product
    expect(response.status()).toBe(404);

    const responseData = await response.json();
    expect(responseData).toHaveProperty("success", false);
  });
});
