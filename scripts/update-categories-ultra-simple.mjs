/**
 * Ultra-Simple Categories for E-Dukkan - Only 3 Main Categories
 * Men, Women, Kids - No subcategories
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// Import models
import "../models/CategorySchema.mjs";
import "../models/ProductSchema.mjs";

const Category = mongoose.model("Category");
const Product = mongoose.model("Product");

const MONGODB_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/e-dukkan";

// Ultra-simple category structure - only 3 categories
const ultraSimpleCategories = [
  {
    name: "Men",
    description: "Fashion and clothing for men",
    slug: "men",
    showInMenu: true,
    level: 0,
    isActive: true,
    displayOrder: 1,
  },
  {
    name: "Women",
    description: "Fashion and clothing for women",
    slug: "women",
    showInMenu: true,
    level: 0,
    isActive: true,
    displayOrder: 2,
  },
  {
    name: "Kids",
    description: "Fashion and clothing for children",
    slug: "kids",
    showInMenu: true,
    level: 0,
    isActive: true,
    displayOrder: 3,
  },
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

async function clearExistingCategories() {
  console.log("🧹 Clearing all existing categories...");
  await Category.deleteMany({});
  console.log("✅ All categories removed");
}

async function createUltraSimpleCategories() {
  console.log("🚀 Creating ultra-simple categories for E-Dukkan...\n");

  await clearExistingCategories();

  console.log("📝 Creating 3 main categories only...\n");

  for (const categoryData of ultraSimpleCategories) {
    const categoryDoc = new Category({
      name: categoryData.name,
      description: categoryData.description,
      slug: categoryData.slug,
      parent: null,
      showInMenu: categoryData.showInMenu,
      level: categoryData.level,
      isActive: categoryData.isActive,
      displayOrder: categoryData.displayOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedCategory = await categoryDoc.save();
    console.log(`✅ Created: ${categoryData.name}`);
  }

  console.log(`\n🎉 Successfully created 3 main categories!`);
  console.log("\n📋 Ultra-Simple Category Structure:");
  console.log("├── Men");
  console.log("├── Women");
  console.log("└── Kids");
}

async function updateProductCategories() {
  console.log("\n🔄 Updating existing products...");

  // Find the Men category as default for existing products
  const defaultCategory = await Category.findOne({ slug: "men" });

  if (defaultCategory) {
    const result = await Product.updateMany(
      { category: { $exists: true } },
      { $set: { category: defaultCategory._id } }
    );
    console.log(
      `✅ Updated ${result.modifiedCount} products to use Men category`
    );
  }
}

async function main() {
  try {
    await connectDB();
    await createUltraSimpleCategories();
    await updateProductCategories();

    console.log("\n🎉 Ultra-simple category setup completed successfully!");
    console.log(
      "Your E-Dukkan now has only 3 main categories: Men, Women, Kids!"
    );
    console.log(
      "\n📊 Total: Only 3 categories - Perfect for clean navigation!"
    );
  } catch (error) {
    console.error("❌ Error creating ultra-simple categories:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("📄 Database connection closed");
    process.exit(0);
  }
}

main();
