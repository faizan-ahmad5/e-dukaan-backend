#!/usr/bin/env node

/**
 * Database reset script
 * Clears all data from the database (use with caution!)
 */

import mongoose from 'mongoose';
import { config } from '../config/environment.mjs';

async function resetDatabase() {
  try {
    console.log('⚠️  Starting database reset...');

    // Confirm environment
    if (config.nodeEnv === 'production') {
      console.error('❌ Cannot reset production database!');
      process.exit(1);
    }

    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log('📦 Connected to database');

    // Get all collection names
    const collections = await mongoose.connection.db.collections();

    if (collections.length === 0) {
      console.log('ℹ️  Database is already empty');
      return;
    }

    console.log(`🗑️  Found ${collections.length} collections to clear`);

    // Drop all collections
    for (const collection of collections) {
      await collection.drop();
      console.log(`   ✓ Cleared ${collection.collectionName}`);
    }

    console.log('✅ Database reset completed successfully!');
    console.log('💡 Run "npm run db:seed" to populate with sample data');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Confirm before proceeding
console.log(
  '⚠️  WARNING: This will permanently delete ALL data in the database!'
);
console.log(`📍 Target database: ${config.database.uri}`);
console.log('');

if (process.argv.includes('--confirm')) {
  resetDatabase();
} else {
  console.log('To proceed, run: npm run db:reset -- --confirm');
  process.exit(0);
}
