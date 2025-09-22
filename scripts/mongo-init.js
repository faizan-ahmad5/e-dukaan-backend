// MongoDB initialization script
db = db.getSiblingDB('e_dukaan_dev');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$',
          description: 'must be a valid email and is required',
        },
      },
    },
  },
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ title: 'text', description: 'text' });
db.orders.createIndex({ user: 1, createdAt: -1 });
db.reviews.createIndex({ product: 1, user: 1 }, { unique: true });

print('Database initialized successfully!');
