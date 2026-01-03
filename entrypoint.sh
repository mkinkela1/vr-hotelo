#!/bin/sh
set -e

echo "Waiting for database..."

# Wait until PostgreSQL is ready using DATABASE_URI
until pg_isready -d "$DATABASE_URI" >/dev/null 2>&1; do
  echo "Database not ready yet, sleeping 2s..."
  sleep 2
done

# #region agent log
# Check for required environment variable for server actions stability [HYPOTHESIS B]
echo "=== RUNTIME KEY CHECK [HYPOTHESIS B] ==="
if [ -z "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" ]; then
  echo "ERROR: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is not set at RUNTIME!"
  echo "This WILL cause 'Failed to find Server Action' errors."
  echo "Generate with: openssl rand -base64 32"
  echo "IMPORTANT: This key MUST be set at Docker BUILD time, not just runtime!"
  echo "Check Coolify environment variables - they may be overriding the build-time key!"
else
  KEY_LEN=$(printf '%s' "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" | wc -c | tr -d ' ')
  echo "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY is set at runtime (length: ${KEY_LEN} characters)"
  echo "First 8 chars: $(printf '%s' "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" | head -c 8)..."
  echo "Last 8 chars: ...$(printf '%s' "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" | tail -c 8)"
  # Check if it looks like base64 (should be ~44 chars for 32 bytes)
fi

echo "Running PayloadCMS migrations..."
npx payload migrate

echo "Starting Next.js server..."
exec node server.js
