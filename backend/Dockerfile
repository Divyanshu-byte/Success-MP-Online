# ── Build Stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client (must happen before build)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder_db"
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ── Production Stage ──────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema (needed for migrations at runtime)
COPY prisma ./prisma

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Generate Prisma client in production image
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder_db" npx prisma generate

# Expose port
EXPOSE 3000

# Resolve Railway's database connection string, run prisma db push, then start server
CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ] || echo \"$DATABASE_URL\" | grep -q \"placeholder\"; then if [ -n \"$DATABASE_PRIVATE_URL\" ]; then export DATABASE_URL=\"$DATABASE_PRIVATE_URL\"; elif [ -n \"$DATABASE_PUBLIC_URL\" ]; then export DATABASE_URL=\"$DATABASE_PUBLIC_URL\"; elif [ -n \"$POSTGRES_URL\" ]; then export DATABASE_URL=\"$POSTGRES_URL\"; fi; fi; npx prisma db push && node build/src/main"]