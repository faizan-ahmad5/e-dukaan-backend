# 🔐 GitHub Secrets Setup Guide

This guide will help you configure all necessary secrets for your CI/CD pipeline to work properly.

## 📋 Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

### 🔑 Core Application Secrets

#### 1. `CODECOV_TOKEN`

**Purpose**: Upload test coverage reports to Codecov

```bash
# Get your token from https://codecov.io
# Sign in with GitHub → Add repository → Copy token
CODECOV_TOKEN=your_codecov_token_here
```

#### 2. `MONGODB_TEST_URI`

**Purpose**: Test database for GitHub Actions

```bash
# Option 1: MongoDB Atlas (Recommended)
MONGODB_TEST_URI=mongodb+srv://testuser:testpass@cluster.mongodb.net/ecommerce-test?retryWrites=true&w=majority

# Option 2: MongoDB Cloud for testing (free tier)
MONGODB_TEST_URI=mongodb+srv://github-actions:secure-password@test-cluster.mongodb.net/ecommerce-ci?retryWrites=true&w=majority
```

### 🚀 Deployment Secrets

#### 3. `STAGING_DEPLOY_URL`

**Purpose**: Staging environment deployment webhook

```bash
# Example for different platforms:

# Render
STAGING_DEPLOY_URL=https://api.render.com/deploy/srv-your-staging-service-id?key=your-deploy-key

# Railway
STAGING_DEPLOY_URL=https://railway.app/api/v2/projects/your-project-id/deployments

# Vercel
STAGING_DEPLOY_URL=https://api.vercel.com/v1/deployments

# Heroku
STAGING_DEPLOY_URL=https://api.heroku.com/apps/your-staging-app/builds
```

#### 4. `PRODUCTION_API_KEY`

**Purpose**: Production deployment authentication

```bash
# Platform-specific API keys:

# Render
PRODUCTION_API_KEY=rnd_your_render_api_key

# Railway
PRODUCTION_API_KEY=your_railway_token

# Vercel
PRODUCTION_API_KEY=your_vercel_token

# AWS (if using ECS)
# Set up AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY instead
```

#### 5. `PRODUCTION_DEPLOY_URL`

**Purpose**: Production deployment endpoint

```bash
# Similar format to staging but for production
PRODUCTION_DEPLOY_URL=https://api.render.com/deploy/srv-your-production-service-id?key=your-deploy-key
```

#### 6. `STAGING_URL` & `PRODUCTION_URL`

**Purpose**: Health check endpoints

```bash
STAGING_URL=https://your-app-staging.onrender.com
PRODUCTION_URL=https://your-app.onrender.com

# Or for custom domains:
STAGING_URL=https://staging-api.yourdomain.com
PRODUCTION_URL=https://api.yourdomain.com
```

### 📧 Notification Secrets

#### 7. `SLACK_WEBHOOK_URL` (Optional)

**Purpose**: Deployment notifications

```bash
# Create a Slack app → Incoming Webhooks → Copy webhook URL
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

#### 8. `DISCORD_WEBHOOK_URL` (Optional)

**Purpose**: Alternative notification method

```bash
# Discord Server → Edit Channel → Integrations → Webhooks → New Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
```

### 🔒 Security Secrets

#### 9. `SNYK_TOKEN` (Optional but recommended)

**Purpose**: Advanced security scanning

```bash
# Get from https://snyk.io → Account Settings → API Token
SNYK_TOKEN=your_snyk_api_token
```

## 🛠️ Platform-Specific Setup

### Option 1: Render (Recommended for simplicity)

1. **Create Render Account**: https://render.com
2. **Create Web Service**:
   - Connect your GitHub repo
   - Build Command: `npm ci`
   - Start Command: `npm start`
3. **Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_super_secure_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
4. **Get Deploy Hook**: Service Settings → Deploy Hook

### Option 2: Railway (Great for developers)

1. **Install Railway CLI**: `npm install -g @railway/cli`
2. **Login**: `railway login`
3. **Create Project**: `railway init`
4. **Set Environment Variables**: `railway variables`
5. **Deploy**: `railway up`

### Option 3: AWS ECS/Fargate (Enterprise scale)

1. **Additional Secrets Needed**:
   ```bash
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   ECS_CLUSTER_NAME=your-cluster-name
   ECS_SERVICE_NAME=your-service-name
   ```

## 🔍 Security Checklist

### ✅ Before Setting Secrets:

- [ ] Never commit real secrets to git
- [ ] Use `.env.example` with dummy values only
- [ ] Rotate secrets regularly (monthly)
- [ ] Use separate databases for test/staging/production
- [ ] Enable 2FA on all service accounts

### ✅ Repository Security:

- [ ] Check `.gitignore` includes:
  ```
  .env
  .env.*
  !.env.example
  node_modules/
  coverage/
  ```

### ✅ Secret Values Format:

- [ ] No quotes around secret values in GitHub UI
- [ ] No trailing spaces or newlines
- [ ] Use strong, unique passwords
- [ ] Generate secure JWT secrets (32+ characters)

## 🧪 Testing Secrets Setup

### Test Environment Variables

```bash
# Create a simple test workflow to verify secrets
name: Test Secrets
on: workflow_dispatch
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test secrets
        run: |
          echo "Codecov token length: ${#CODECOV_TOKEN}"
          echo "MongoDB URI format: $(echo $MONGODB_TEST_URI | grep -o 'mongodb.*://' || echo 'Invalid')"
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
          MONGODB_TEST_URI: ${{ secrets.MONGODB_TEST_URI }}
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Secret not found"**

   - Check secret name spelling (case-sensitive)
   - Verify secret is set in correct repository

2. **"Invalid MongoDB URI"**

   - Test connection locally first
   - Check IP whitelist in MongoDB Atlas
   - Verify username/password encoding

3. **"Deploy hook failed"**
   - Test webhook URL manually with curl
   - Check deployment service status
   - Verify API key permissions

### Debug Commands:

```bash
# Test MongoDB connection
mongosh "your_mongodb_uri" --eval "db.adminCommand('ismaster')"

# Test webhook endpoint
curl -X POST "your_deploy_hook_url"

# Validate JWT secret strength
node -e "console.log('JWT Secret length:', process.env.JWT_SECRET?.length || 0)"
```

## 🎯 Next Steps

1. **Set all required secrets** in GitHub repository
2. **Push changes** to trigger CI/CD pipeline
3. **Monitor Actions tab** for successful pipeline run
4. **Test staging deployment** with sample data
5. **Approve production deployment** when ready

---

💡 **Pro Tip**: Start with Render or Railway for simplicity, then migrate to AWS/GCP when you need enterprise features.

🔐 **Security Reminder**: Never share these secrets publicly or commit them to version control!
