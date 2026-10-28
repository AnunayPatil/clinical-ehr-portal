# Multi-stage Dockerfile for Clinical EHR & Healthcare Administrative Portal
# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build configs
COPY tsconfig*.json ./
COPY src ./src
COPY public ./public

# Build server and client TypeScript
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Security: run as non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
