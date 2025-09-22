#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "❌ .env.production file not found!"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if all required environment variables are set
required_vars=("NODE_ENV" "MONGODB_URI" "JWT_SECRET" "STRIPE_SECRET_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set!"
        exit 1
    fi
done

# Run security audit
echo "🔒 Running security audit..."
npm audit --production --audit-level=moderate || {
    echo "❌ Security vulnerabilities found! Please fix them before deployment."
    exit 1
}

# Run tests
echo "🧪 Running tests..."
npm run test:ci || {
    echo "❌ Tests failed! Deployment aborted."
    exit 1
}

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t ecommerce-backend:latest . || {
    echo "❌ Docker build failed!"
    exit 1
}

# Run container health check
echo "🏥 Running health check..."
docker run -d --name temp-health-check -p 5001:5000 ecommerce-backend:latest
sleep 10

if curl -f http://localhost:5001/health; then
    echo "✅ Health check passed!"
    docker stop temp-health-check
    docker rm temp-health-check
else
    echo "❌ Health check failed!"
    docker stop temp-health-check
    docker rm temp-health-check
    exit 1
fi

# Deploy (customize based on your deployment platform)
echo "🌟 Deploying to production..."

# Example: Deploy to your cloud provider
# Uncomment and modify based on your deployment method:

# For Railway:
# railway deploy

# For Render:
# curl -X POST "$RENDER_DEPLOY_HOOK"

# For DigitalOcean App Platform:
# doctl apps create-deployment $APP_ID

# For AWS ECS:
# aws ecs update-service --cluster prod-cluster --service ecommerce-backend --force-new-deployment

echo "✅ Production deployment completed successfully!"
echo "🌍 Application should be available at: $PRODUCTION_URL"

# Send deployment notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"✅ E-Commerce Backend deployed to production successfully!"}' \
        "$SLACK_WEBHOOK_URL"
fi