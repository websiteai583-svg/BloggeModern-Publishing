# ==============================================================================
# BLOGGE PRODUCTION DOCKERFILE FOR GOOGLE CLOUD RUN
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy application source code
COPY . .

# Compile frontend and bundle backend server to dist/server.cjs
RUN npm run build

# ==============================================================================
# Production Runtime Container
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi && npm cache clean --force

# Copy compiled frontend and bundled server from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Ensure permissions for non-root node user
RUN chown -R node:node /app

# Expose production port
EXPOSE 3000

# Non-root user for security
USER node

# Start production server
CMD ["node", "dist/server.cjs"]
