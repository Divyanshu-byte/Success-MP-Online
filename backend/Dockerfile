# ── Build Stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client (must happen before build)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ── Production Stage ──────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema (needed for migrations at runtime)
COPY prisma ./prisma

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Generate Prisma client in production image
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node build/src/main"]
