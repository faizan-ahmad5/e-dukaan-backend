#!/bin/bash

# Staging deployment script
set -e

echo "🚀 Starting staging deployment..."

# Load staging environment variables
if [ -f .env.staging ]; then
    source .env.staging
else
    echo "❌ .env.staging file not found!"
    exit 1
fi

# Run tests before deployment
echo "🧪 Running tests..."
npm run test:ci || {
    echo "❌ Tests failed! Staging deployment aborted."
    exit 1
}

# Build and test Docker image
echo "🏗️ Building Docker image for staging..."
docker build -t ecommerce-backend:staging . || {
    echo "❌ Docker build failed!"
    exit 1
}

# Deploy to staging environment
echo "🌟 Deploying to staging environment..."

# Example deployment commands (customize for your platform):

# For Render staging:
# curl -X POST "$STAGING_DEPLOY_HOOK"

# For Railway staging:
# railway deploy --environment=staging

# For Heroku staging:
# git push staging main

# Health check on staging
echo "🏥 Running staging health check..."
sleep 30  # Wait for deployment to complete

if curl -f "$STAGING_URL/health"; then
    echo "✅ Staging deployment successful!"
    
    # Run E2E tests against staging
    echo "🎭 Running E2E tests against staging..."
    PLAYWRIGHT_BASE_URL="$STAGING_URL" npm run test:e2e || {
        echo "⚠️  E2E tests failed on staging. Please investigate."
    }
    
else
    echo "❌ Staging health check failed!"
    exit 1
fi

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚀 E-Commerce Backend deployed to staging: '$STAGING_URL'"}' \
        "$SLACK_WEBHOOK_URL"
fi

echo "✅ Staging deployment completed!"
echo "🌍 Staging environment: $STAGING_URL"