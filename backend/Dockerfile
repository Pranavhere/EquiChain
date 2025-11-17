# Backend Service
FROM node:20-alpine AS builder

WORKDIR /app

# Install Python and build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install Python and build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy contract deployments (will be mounted in docker-compose)
RUN mkdir -p ../contracts/deployments

# Expose port
EXPOSE 8000

# Start server
CMD ["node", "dist/index.js"]
