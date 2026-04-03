#!/bin/bash
# Autopilot - Quick Setup Script
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Setting up Autopilot..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  # Generate a random JWT secret
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '\n' | head -c 64)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/change-me-to-a-random-64-character-string-in-production/$JWT_SECRET/" .env
  else
    sed -i "s/change-me-to-a-random-64-character-string-in-production/$JWT_SECRET/" .env
  fi
  echo "   ✅ .env created with random JWT_SECRET"
else
  echo "   ✅ .env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Pushing database schema..."
npx prisma db push

# Build the app
echo "🏗️  Building the application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the app:        npm start"
echo "  2. Seed demo data:       curl http://localhost:3000/api/seed"
echo "  3. Login with:           demo@autopilot.io / demo1234"
echo ""
echo "Optional:"
echo "  - Prisma Studio:         npx prisma studio"
echo "  - Dev mode:              npm run dev"
echo ""
