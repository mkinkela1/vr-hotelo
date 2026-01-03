#!/bin/sh
set -e

echo "Waiting for database..."

# Wait until PostgreSQL is ready using DATABASE_URI
until pg_isready -d "$DATABASE_URI" >/dev/null 2>&1; do
  echo "Database not ready yet, sleeping 2s..."
  sleep 2
done

# Check for required environment variable for server actions stability
if [ -z "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" ]; then
  echo "WARNING: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is not set!"
  echo "This can cause 'Failed to find Server Action' errors after some time."
  echo "Please set a consistent 32+ character key in your environment."
fi

echo "Running PayloadCMS migrations..."
npx payload migrate

echo "Starting Next.js server..."
exec node server.js
