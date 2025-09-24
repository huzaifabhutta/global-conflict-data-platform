# Backend Dockerfile
FROM node:18-bullseye-slim

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma/ ./prisma/

# Install dependencies (use install if ci fails)
RUN npm ci --only=production || npm install --only=production

# Install development dependencies needed for build
RUN npm install -D typescript ts-node prisma

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Create logs directory
RUN mkdir -p logs

# Start the application
CMD ["npm", "start"]