#!/bin/bash
# ============================================================
# VPS Deploy Script — run this instead of manual git pull
# Usage: bash deploy.sh
# ============================================================

set -e

echo "▶ Pulling latest code..."
git fetch origin main
git checkout prisma/schema.prisma   # discard any local schema changes first
git pull origin main

echo "▶ Patching schema for PostgreSQL (production)..."
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "▶ Installing dependencies..."
npm ci

echo "▶ Generating Prisma client..."
npx prisma generate

echo "▶ Pushing schema to database..."
npx prisma db push

echo "▶ Building..."
npm run build

echo "▶ Restarting PM2..."
pm2 restart all --update-env

echo "✅ Deploy complete!"
pm2 logs nutriguide --lines 20 --nostream
