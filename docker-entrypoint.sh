#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET is not set" >&2
  exit 1
fi

echo "Applying database schema..."
node node_modules/prisma/build/index.js db push --skip-generate

echo "Starting Journal..."
exec node server.js
