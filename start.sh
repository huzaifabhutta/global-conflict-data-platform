#!/bin/bash

echo "🚀 Starting Global Conflict Data Platform"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Building and starting containers..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🗄️  Running database migrations..."
sleep 5  # Give PostgreSQL more time to fully start
docker exec conflict-backend npx prisma db push --accept-data-loss || {
    echo "⚠️  Schema push failed, trying generate and migrate..."
    docker exec conflict-backend npx prisma generate
    docker exec conflict-backend npx prisma db push --accept-data-loss
}

echo "🌱 Seeding database with sample data..."
docker exec conflict-backend npm run seed

echo ""
echo "✅ Platform is ready!"
echo ""
echo "🌐 Frontend:     http://localhost:3000"
echo "🔧 Backend API:  http://localhost:3001"
echo "📖 API Docs:     http://localhost:3001/api/docs"
echo ""
echo "👤 Demo Accounts:"
echo "   Admin:  admin@acled.com / admin123"
echo "   User:   user@acled.com / user123"
echo ""
echo "To stop the platform, run: docker-compose down"