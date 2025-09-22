# Use Node.js LTS Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S ecommerce -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=ecommerce:nodejs . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads/avatars uploads/products uploads/reviews && \
    chown -R ecommerce:nodejs uploads && \
    chmod -R 755 uploads

# Switch to non-root user
USER ecommerce

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => { \
        r.statusCode === 200 ? process.exit(0) : process.exit(1) \
    })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.mjs"]