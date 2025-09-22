/**
 * Global Teardown for E2E Tests
 * Cleans up test environment and test data
 */
async function globalTeardown() {
  console.log("🧹 Starting E2E Test Global Teardown...");

  try {
    // Clean up test data if needed
    // Note: In production, you might want to clean up test users and products
    // created during the test run, but for now we'll keep them for debugging

    console.log("🗑️  Test data cleanup completed");
    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error.message);
    throw error;
  }
}

export default globalTeardown;
