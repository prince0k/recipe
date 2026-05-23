#!/bin/bash
# ============================================================
# VPS Deploy Script — run this instead of manual git pull
# Usage: bash deploy.sh
# ============================================================

set -e

echo "▶ Pulling latest code..."
git fetch origin main
git checkout prisma/schema.prisma package-lock.json   # discard local changes first
git pull origin main

# Detect database provider from the same sources Prisma CLI uses:
# 1. System environment variable DATABASE_URL
# 2. .env file
# 3. .env.production file (as fallback)
DB_URL="$DATABASE_URL"

if [ -z "$DB_URL" ] && [ -f ".env" ]; then
  DB_URL=$(grep -E "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' -d "'" | tr -d '\r')
fi

if [ -z "$DB_URL" ] && [ -f ".env.production" ]; then
  DB_URL=$(grep -E "^DATABASE_URL=" .env.production | cut -d'=' -f2- | tr -d '"' -d "'" | tr -d '\r')
fi

# Default provider is sqlite, check if postgresql is requested
DB_PROVIDER="sqlite"
if [[ "$DB_URL" == postgresql://* ]] || [[ "$DB_URL" == postgres://* ]]; then
  DB_PROVIDER="postgresql"
fi

echo "▶ Detected database provider: $DB_PROVIDER"
if [ "$DB_PROVIDER" = "postgresql" ]; then
  echo "▶ Patching schema for PostgreSQL (production)..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
else
  echo "▶ Ensuring schema uses SQLite (production)..."
  sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
fi

echo "▶ Installing dependencies..."
npm ci

echo "▶ Generating Prisma client..."
npx prisma generate

echo "▶ Pushing schema to database..."
npx prisma db push

echo "▶ Migrating Base64 images to local files..."
node scripts/migrate-images.mjs || echo "⚠️ Migration skipped or failed, continuing..."

echo "▶ Building..."
npm run build

echo "▶ Restarting PM2..."
pm2 startOrReload ecosystem.config.js --env production --update-env

echo "✅ Deploy complete!"
pm2 logs nutriguide --lines 20 --nostream
