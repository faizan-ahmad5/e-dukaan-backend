#!/bin/bash

# Development setup script
set -e

echo "🚀 Setting up E-Commerce Backend development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
REQUIRED_VERSION="20.0.0"
if ! printf '%s\n%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V -C; then
    echo "⚠️  Warning: Node.js version $NODE_VERSION detected. Recommended: $REQUIRED_VERSION or higher."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual configuration values!"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/{avatars,products,reviews}
chmod 755 uploads uploads/avatars uploads/products uploads/reviews

# Install Playwright browsers for E2E testing
echo "🎭 Installing Playwright browsers..."
npx playwright install --with-deps

# Run initial linting
echo "🧹 Running code quality checks..."
npm run lint:check || {
    echo "⚠️  Linting issues found. Run 'npm run lint' to fix them."
}

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected. You can use 'docker-compose up' to start services."
else
    echo "⚠️  Docker not found. Install Docker to use containerized services."
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with actual configuration values"
echo "2. Start your MongoDB instance (or run 'docker-compose up mongodb')"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run 'npm test' to execute all tests"
echo ""
echo "🔗 Useful commands:"
echo "  npm run dev          - Start development server with hot reload"
echo "  npm test             - Run all tests (unit + integration + e2e)"
echo "  npm run lint         - Fix code formatting issues"
echo "  npm run test:e2e:ui  - Run E2E tests with UI"
echo "  docker-compose up    - Start all services with Docker"
echo ""