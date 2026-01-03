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
  echo "ERROR: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is not set!"
  echo "This WILL cause 'Failed to find Server Action' errors."
  echo "Generate with: openssl rand -base64 32"
  echo "IMPORTANT: This key MUST be set at Docker BUILD time, not just runtime!"
else
  KEY_LEN=$(printf '%s' "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" | wc -c | tr -d ' ')
  echo "Server Actions Encryption Key: ${KEY_LEN} characters"
  # Check if it looks like base64 (should be ~44 chars for 32 bytes)
  if [ "$KEY_LEN" -eq 64 ]; then
    echo "WARNING: Key length 64 suggests hex format. Next.js expects base64!"
    echo "Generate with: openssl rand -base64 32 (gives ~44 chars)"
  fi
fi

echo "Running PayloadCMS migrations..."
npx payload migrate

echo "Starting Next.js server..."
exec node server.js
