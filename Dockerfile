# -----------------------
# Base image
# -----------------------
FROM node:22.12.0-alpine AS base
RUN apk add --no-cache libc6-compat postgresql-client bash

WORKDIR /app

# -----------------------
# Dependencies stage
# -----------------------
FROM base AS deps

# Copy package files and install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------
# Build stage
# -----------------------
FROM base AS builder
WORKDIR /app

# Build arguments for server actions encryption
# IMPORTANT: This MUST be set at build time for server actions to work correctly
# Generate with: openssl rand -base64 32
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy full source code (needed for Payload migrations)
COPY . .

# Build Next.js standalone output
RUN \
  echo "=== BUILD TIME KEY CHECK ===" && \
  if [ -z "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" ]; then \
    echo "ERROR: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY not set at build time!"; \
    echo "Server actions WILL fail. Generate with: openssl rand -base64 32"; \
    echo "Pass as --build-arg NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<your-key>"; \
  else \
    KEY_LEN=$(printf '%s' "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" | wc -c | tr -d ' '); \
    echo "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is set (length: ${KEY_LEN} chars)"; \
    if [ "$KEY_LEN" -lt 40 ]; then \
      echo "WARNING: Key seems short. Expected ~44 chars for base64."; \
    fi; \
  fi && \
  echo "===========================" && \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------
# Runner / Production
# -----------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy full source code and package.json (needed for migrations)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/.env* ./

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
