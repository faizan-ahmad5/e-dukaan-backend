import mongoose from "mongoose";
import { Category } from "../models/CategorySchema.mjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Define initial categories
    const mainCategories = [
      {
        name: "Electronics",
        description: "Latest gadgets and electronic devices",
        icon: "📱",
        displayOrder: 1,
        subcategories: [
          {
            name: "Smartphones",
            icon: "📱",
            description: "Mobile phones and accessories",
          },
          {
            name: "Laptops & Computers",
            icon: "💻",
            description: "Laptops, desktops, and computer accessories",
          },
          {
            name: "Audio & Headphones",
            icon: "🎧",
            description: "Headphones, speakers, and audio equipment",
          },
          {
            name: "Gaming",
            icon: "🎮",
            description: "Gaming consoles, games, and accessories",
          },
          {
            name: "Smart Home",
            icon: "🏠",
            description: "Smart home devices and IoT products",
          },
        ],
      },
      {
        name: "Clothing & Fashion",
        description: "Latest fashion trends and clothing",
        icon: "👕",
        displayOrder: 2,
        subcategories: [
          {
            name: "Men's Clothing",
            icon: "👔",
            description: "Clothing for men",
          },
          {
            name: "Women's Clothing",
            icon: "👗",
            description: "Clothing for women",
          },
          {
            name: "Kids' Clothing",
            icon: "🧒",
            description: "Clothing for children",
          },
          { name: "Shoes", icon: "👟", description: "Footwear for all ages" },
          {
            name: "Fashion Accessories",
            icon: "👜",
            description: "Fashion accessories and jewelry",
          },
        ],
      },
      {
        name: "Home & Garden",
        description: "Home improvement and garden supplies",
        icon: "🏡",
        displayOrder: 3,
        subcategories: [
          {
            name: "Furniture",
            icon: "🪑",
            description: "Home and office furniture",
          },
          {
            name: "Kitchen & Dining",
            icon: "🍽️",
            description: "Kitchen appliances and dining items",
          },
          {
            name: "Bedding & Bath",
            icon: "🛏️",
            description: "Bedroom and bathroom essentials",
          },
          {
            name: "Garden & Outdoor",
            icon: "🌱",
            description: "Gardening tools and outdoor equipment",
          },
          {
            name: "Home Decor",
            icon: "🎨",
            description: "Decorative items and artwork",
          },
        ],
      },
      {
        name: "Books & Media",
        description: "Books, magazines, and digital media",
        icon: "📚",
        displayOrder: 4,
        subcategories: [
          {
            name: "Fiction",
            icon: "📖",
            description: "Fiction books and novels",
          },
          {
            name: "Non-Fiction",
            icon: "📔",
            description: "Educational and informational books",
          },
          {
            name: "Children's Books",
            icon: "📚",
            description: "Books for children and young adults",
          },
          {
            name: "eBooks",
            icon: "💻",
            description: "Digital books and audiobooks",
          },
        ],
      },
      {
        name: "Sports & Fitness",
        description: "Sports equipment and fitness gear",
        icon: "⚽",
        displayOrder: 5,
        subcategories: [
          {
            name: "Fitness Equipment",
            icon: "💪",
            description: "Home gym and workout equipment",
          },
          {
            name: "Outdoor Sports",
            icon: "🏃",
            description: "Equipment for outdoor activities",
          },
          {
            name: "Team Sports",
            icon: "⚽",
            description: "Equipment for team sports",
          },
          {
            name: "Sportswear",
            icon: "👕",
            description: "Athletic clothing and accessories",
          },
        ],
      },
      {
        name: "Beauty & Personal Care",
        description: "Beauty products and personal care items",
        icon: "💄",
        displayOrder: 6,
        subcategories: [
          {
            name: "Skincare",
            icon: "🧴",
            description: "Face and body skincare products",
          },
          {
            name: "Makeup",
            icon: "💄",
            description: "Cosmetics and beauty tools",
          },
          {
            name: "Hair Care",
            icon: "💇",
            description: "Hair care and styling products",
          },
          {
            name: "Fragrances",
            icon: "🌸",
            description: "Perfumes and body sprays",
          },
        ],
      },
      {
        name: "Toys & Games",
        description: "Toys, games, and entertainment for all ages",
        icon: "🧸",
        displayOrder: 7,
        subcategories: [
          {
            name: "Educational Toys",
            icon: "🎓",
            description: "Learning and educational toys",
          },
          {
            name: "Action Figures",
            icon: "🤖",
            description: "Action figures and collectibles",
          },
          {
            name: "Board Games",
            icon: "🎲",
            description: "Board games and puzzles",
          },
          {
            name: "Outdoor Toys",
            icon: "🏀",
            description: "Outdoor play equipment",
          },
        ],
      },
      {
        name: "Food & Beverages",
        description: "Gourmet food and specialty beverages",
        icon: "🍕",
        displayOrder: 8,
        subcategories: [
          {
            name: "Snacks",
            icon: "🍿",
            description: "Chips, crackers, and snack foods",
          },
          {
            name: "Beverages",
            icon: "🥤",
            description: "Drinks and beverages",
          },
          {
            name: "Organic Foods",
            icon: "🥬",
            description: "Organic and health foods",
          },
          {
            name: "Specialty Items",
            icon: "🍯",
            description: "Gourmet and specialty food items",
          },
        ],
      },
      {
        name: "Automotive",
        description: "Car accessories and automotive parts",
        icon: "🚗",
        displayOrder: 9,
        subcategories: [
          {
            name: "Car Electronics",
            icon: "📻",
            description: "GPS, dash cams, and car electronics",
          },
          {
            name: "Car Care",
            icon: "🧽",
            description: "Cleaning and maintenance products",
          },
          {
            name: "Car Accessories",
            icon: "🔧",
            description: "Car accessories and tools",
          },
        ],
      },
    ];

    // Create main categories first
    const createdMainCategories = [];
    for (const mainCat of mainCategories) {
      const { subcategories, ...mainCategoryData } = mainCat;
      const category = new Category(mainCategoryData);
      await category.save();
      createdMainCategories.push({ ...category.toObject(), subcategories });
      console.log(`Created main category: ${category.name}`);
    }

    // Create subcategories
    for (const mainCat of createdMainCategories) {
      if (mainCat.subcategories) {
        for (const subCat of mainCat.subcategories) {
          const subcategory = new Category({
            ...subCat,
            parentCategory: mainCat._id,
            level: 1,
            displayOrder: mainCat.subcategories.indexOf(subCat) + 1,
          });
          await subcategory.save();
          console.log(
            `Created subcategory: ${subcategory.name} under ${mainCat.name}`
          );
        }
      }
    }

    console.log("✅ Categories seeded successfully!");
    console.log(`📊 Created ${mainCategories.length} main categories`);
    console.log(
      `📊 Created ${mainCategories.reduce(
        (sum, cat) => sum + (cat.subcategories?.length || 0),
        0
      )} subcategories`
    );

    // Display category tree
    const categoryTree = await Category.getCategoryTree();
    console.log("\n🌳 Category Tree:");
    categoryTree.forEach((cat) => {
      console.log(`├── ${cat.icon} ${cat.name}`);
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child, index) => {
          const isLast = index === cat.children.length - 1;
          console.log(
            `│   ${isLast ? "└──" : "├──"} ${child.icon} ${child.name}`
          );
        });
      }
    });
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedCategories();
