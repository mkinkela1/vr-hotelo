# Base image
FROM node:22.12.0-alpine AS base

# -----------------------
# Install dependencies
# -----------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------
# Build Next.js
# -----------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------
# Runner / Production
# -----------------------
FROM node:22.12.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Install PostgreSQL client for DB readiness check
RUN apk add --no-cache postgresql-client bash

# Copy entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set permissions for .next folder
RUN mkdir -p .next && chown nextjs:nodejs .next

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Use entrypoint to run migrations then start server
ENTRYPOINT ["/app/entrypoint.sh"]
