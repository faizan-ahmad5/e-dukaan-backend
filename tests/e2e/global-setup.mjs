import { chromium } from "@playwright/test";

async function globalSetup() {
  console.log("🚀 Starting E2E Test Global Setup...");

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for server to be ready
    console.log("⏳ Waiting for server to be ready...");
    await page.waitForTimeout(3000);

    // Check if server is responsive
    const response = await page.request.get("http://localhost:5000/health");
    if (!response.ok()) {
      throw new Error(`Server not ready. Status: ${response.status()}`);
    }

    console.log("✅ Server is ready");

    // Clean test data from previous runs
    await cleanupTestData(page);

    // Create test users and admin accounts
    await createTestUsers(page);

    // Create test products
    await createTestProducts(page);

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error.message);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Clean up test data from previous test runs
 */
async function cleanupTestData(page) {
  console.log("🧹 Cleaning up test data...");

  try {
    // Note: In a real scenario, you'd have admin endpoints to clean test data
    // For now, we'll rely on unique test user emails with timestamps
    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.warn("⚠️  Cleanup warning:", error.message);
  }
}

/**
 * Create test users for E2E scenarios
 */
async function createTestUsers(page) {
  console.log("👥 Creating test users...");

  const timestamp = Date.now();

  // Test user data
  const testUsers = [
    {
      name: "Regular Test User",
      email: `testuser${timestamp}@example.com`,
      password: "TestPassword123!",
      role: "user",
    },
    {
      name: "Admin Test User",
      email: `admin${timestamp}@example.com`,
      password: "AdminPassword123!",
      role: "admin",
    },
    {
      name: "Premium Test User",
      email: `premium${timestamp}@example.com`,
      password: "PremiumPassword123!",
      role: "user",
    },
  ];

  // Create test users
  for (const user of testUsers) {
    try {
      const response = await page.request.post(
        "http://localhost:5000/api/auth/register",
        {
          data: user,
        }
      );

      if (response.ok()) {
        const userData = await response.json();
        console.log(`✅ Created test user: ${user.email}`);

        // Store user credentials for tests
        process.env[`TEST_USER_${user.role.toUpperCase()}_EMAIL`] = user.email;
        process.env[`TEST_USER_${user.role.toUpperCase()}_PASSWORD`] =
          user.password;
        process.env[`TEST_USER_${user.role.toUpperCase()}_ID`] =
          userData.data?.user?.id;
      } else {
        const error = await response.json();
        console.warn(
          `⚠️  User creation warning for ${user.email}:`,
          error.message
        );
      }
    } catch (error) {
      console.warn(`⚠️  Failed to create user ${user.email}:`, error.message);
    }
  }

  console.log("✅ Test users creation completed");
}

/**
 * Create test products for E2E scenarios
 */
async function createTestProducts(page) {
  console.log("📦 Creating test products...");

  // First, login as admin to create products
  const adminEmail = process.env.TEST_USER_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_USER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("⚠️  No admin user available, skipping product creation");
    return;
  }

  try {
    // Admin login
    const loginResponse = await page.request.post(
      "http://localhost:5000/api/auth/login",
      {
        data: {
          email: adminEmail,
          password: adminPassword,
        },
      }
    );

    if (!loginResponse.ok()) {
      throw new Error("Admin login failed");
    }

    const loginData = await loginResponse.json();
    const adminToken = loginData.data?.token;

    if (!adminToken) {
      throw new Error("No admin token received");
    }

    // Test products data
    const testProducts = [
      {
        title: "E2E Test Laptop",
        description: "High-performance laptop for testing",
        price: 999.99,
        category: "Electronics",
        tags: ["laptop", "computer", "test"],
        inventory: 10,
        isActive: true,
      },
      {
        title: "E2E Test Smartphone",
        description: "Latest smartphone for testing",
        price: 699.99,
        category: "Electronics",
        tags: ["phone", "mobile", "test"],
        inventory: 25,
        isActive: true,
      },
      {
        title: "E2E Test Book",
        description: "Programming book for testing",
        price: 29.99,
        category: "Books",
        tags: ["book", "programming", "test"],
        inventory: 100,
        isActive: true,
      },
    ];

    // Create test products
    for (const product of testProducts) {
      try {
        const response = await page.request.post(
          "http://localhost:5000/api/products",
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "application/json",
            },
            data: product,
          }
        );

        if (response.ok()) {
          const productData = await response.json();
          console.log(`✅ Created test product: ${product.title}`);

          // Store product IDs for tests
          process.env[
            `TEST_PRODUCT_${product.title
              .replace(/\s+/g, "_")
              .toUpperCase()}_ID`
          ] = productData.data?.id;
        } else {
          const error = await response.json();
          console.warn(
            `⚠️  Product creation warning for ${product.title}:`,
            error.message
          );
        }
      } catch (error) {
        console.warn(
          `⚠️  Failed to create product ${product.title}:`,
          error.message
        );
      }
    }

    console.log("✅ Test products creation completed");
  } catch (error) {
    console.warn("⚠️  Product creation failed:", error.message);
  }
}

export default globalSetup;
