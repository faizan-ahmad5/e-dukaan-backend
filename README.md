# User Management API

This is a User Management API built with Node.js, Express, and MongoDB. The API allows you to register users, log in, and perform CRUD operations on user data while ensuring secure access through JSON Web Tokens (JWT).

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
- [Error Handling](#error-handling)

## Features

- User registration and login with JWT authentication.
- Secure routes for user management (CRUD operations).
- Error handling for various scenarios.
- Excludes sensitive information (like passwords) in responses.

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT)
- dotenv for environment variable management

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://faizan-ahmad5/jwt-auth-atlas-crud.git
   cd jwt-auth-atlas-crud
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add your environment variables:

   ```bash
   NODE_ENV=development  # or 'production'
   PORT=5000             # Your preferred port
   MONGO_URI=mongodb+srv://<username>:<password>@yourcluster.mongodb.net/<dbname>?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Connect to MongoDB:**
   - Make sure you have a MongoDB instance running and replace the `<username>`, `<password>`, and `<dbname>` in the `MONGO_URI`.

5. **Start the server:**

   ```bash
   npm run dev  # or `node server.js` if no script is defined
   ```

6. **Access the API:**
   - Open your browser or Postman and go to `http://localhost:5000`.

## API Endpoints

### Authentication

- **Register a new user:**

  - **URL:** `/api/auth/register`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "name": "User Name",
      "email": "user@example.com",
      "password": "password123"
    }
    ```

- **Login user:**

  - **URL:** `/api/auth/login`
  - **Method:** `POST`
  - **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```

### User Management

- **Get all users:**

  - **URL:** `/api/users`
  - **Method:** `GET`
  - **Authorization:** `Bearer <token>`

- **Get a single user by ID:**

  - **URL:** `/api/users/:id`
  - **Method:** `GET`
  - **Authorization:** `Bearer <token>`

- **Update a user by ID:**

  - **URL:** `/api/users/:id`
  - **Method:** `PUT`
  - **Authorization:** `Bearer <token>`
  - **Body:**
    ```json
    {
      "name": "Updated User Name",
      "email": "updatedemail@example.com"
    }
    ```

- **Delete a user by ID:**

  - **URL:** `/api/users/:id`
  - **Method:** `DELETE`
  - **Authorization:** `Bearer <token>`

## Error Handling

The API includes centralized error handling that returns the appropriate HTTP status codes and messages for different error scenarios.

### Customization Tips
- Replace the placeholders like `yourusername`, `your-repo-name`, and any other specific information relevant to your project.
- Adjust the content to reflect any additional features or specific setup steps relevant to your API.
- If you have a testing setup, consider adding a section on how to run tests.

