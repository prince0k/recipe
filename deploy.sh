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

# Helper function to extract DATABASE_URL from an env file
get_db_url_from_file() {
  local file="$1"
  if [ -f "$file" ]; then
    local line
    line=$(grep -E "^[[:space:]]*(export[[:space:]]+)?DATABASE_URL[[:space:]]*=" "$file" | head -n 1)
    if [ -n "$line" ]; then
      local val
      val=$(echo "$line" | cut -d'=' -f2- | tr -d '\r')
      # Trim whitespace and quotes
      val=$(echo "$val" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
      echo "$val"
    fi
  fi
}

DB_URL="$DATABASE_URL"
if [ -z "$DB_URL" ]; then
  DB_URL=$(get_db_url_from_file ".env")
fi
if [ -z "$DB_URL" ]; then
  DB_URL=$(get_db_url_from_file ".env.production")
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
