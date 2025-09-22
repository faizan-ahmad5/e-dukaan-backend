#!/usr/bin/env node

/**
 * Database seeding script for development/testing
 * Creates sample data for testing the e-commerce platform
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/UserSchema.mjs';
import { Product } from '../models/ProductSchema.mjs';
import { config } from '../config/environment.mjs';

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@edukaan.com',
    password: await bcrypt.hash('Admin123!', 10),
    isAdmin: true,
    isVerified: true,
    status: 'active',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: await bcrypt.hash('User123!', 10),
    isVerified: true,
    status: 'active',
    bio: 'Regular customer who loves shopping',
    phone: '+1234567890',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: await bcrypt.hash('User123!', 10),
    isVerified: true,
    status: 'active',
    bio: 'Tech enthusiast and early adopter',
    phone: '+1234567891',
  },
];

const seedProducts = [
  {
    title: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced camera and A17 Pro chip',
    price: 999.99,
    category: 'electronics',
    brand: 'Apple',
    stock: 50,
    lowStockThreshold: 5,
    status: 'active',
    isFeatured: true,
    images: [
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium_AV1?wid=5120&hei=2880&fmt=webp&qlt=90&.v=1692923779207',
    ],
    tags: ['smartphone', 'apple', 'premium'],
    specifications: {
      screen: '6.1 inches',
      storage: '256GB',
      camera: '48MP',
      battery: '3274 mAh',
    },
  },
  {
    title: 'MacBook Pro 14"',
    description: 'Powerful laptop for professionals with M3 chip',
    price: 1999.99,
    category: 'electronics',
    brand: 'Apple',
    stock: 25,
    lowStockThreshold: 3,
    status: 'active',
    isFeatured: true,
    images: [
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
    ],
    tags: ['laptop', 'apple', 'professional'],
    specifications: {
      processor: 'Apple M3',
      memory: '16GB',
      storage: '512GB SSD',
      display: '14.2-inch Liquid Retina XDR',
    },
  },
  {
    title: 'Sony WH-1000XM4',
    description: 'Industry-leading noise canceling wireless headphones',
    price: 349.99,
    category: 'electronics',
    brand: 'Sony',
    stock: 100,
    lowStockThreshold: 10,
    status: 'active',
    isFeatured: false,
    images: [
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6408/6408356_sd.jpg',
    ],
    tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
    specifications: {
      type: 'Over-ear',
      connectivity: 'Bluetooth 5.0',
      batteryLife: '30 hours',
      noiseCanceling: 'Active',
    },
  },
  {
    title: 'Nike Air Max 270',
    description: 'Lifestyle running shoes with Max Air technology',
    price: 149.99,
    category: 'fashion',
    brand: 'Nike',
    stock: 75,
    lowStockThreshold: 10,
    status: 'active',
    isFeatured: false,
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-665455a5-45de-40fb-945f-c1852b82400d/air-max-270-mens-shoes-KkLcGR.png',
    ],
    tags: ['shoes', 'nike', 'running', 'lifestyle'],
    specifications: {
      type: 'Running Shoes',
      material: 'Mesh and synthetic',
      sole: 'Rubber with Max Air',
      fit: 'True to size',
    },
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log('📦 Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Insert seed data
    const users = await User.insertMany(seedUsers);
    console.log(`👥 Created ${users.length} users`);

    const products = await Product.insertMany(seedProducts);
    console.log(`📦 Created ${products.length} products`);

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('🔑 Default Admin Credentials:');
    console.log('   Email: admin@edukaan.com');
    console.log('   Password: Admin123!');
    console.log('');
    console.log('👤 Test User Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: User123!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
