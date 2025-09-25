#!/bin/sh
set -e

echo "Waiting for database..."

# Wait until PostgreSQL is ready using DATABASE_URL
until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
  echo "Database not ready yet, sleeping 2s..."
  sleep 2
done

echo "Running PayloadCMS migrations..."
npx payload migrate:latest

echo "Starting Next.js server..."
exec node server.js
