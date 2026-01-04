#!/bin/sh
set -e

echo "Waiting for database..."

# Wait until PostgreSQL is ready using DATABASE_URI
until pg_isready -d "$DATABASE_URI" >/dev/null 2>&1; do
  echo "Database not ready yet, sleeping 2s..."
  sleep 2
done

# Check for required environment variable for server actions stability
echo "=== RUNTIME KEY CHECK ==="
if [ -z "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" ]; then
  echo "FATAL: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is not set at runtime."
  echo "Refusing to start because Server Actions will be broken."
  exit 1
fi

echo "Running PayloadCMS migrations..."
npx payload migrate

echo "Starting Next.js server..."
exec node server.js
