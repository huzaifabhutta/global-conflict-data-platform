#!/bin/bash

echo "🧪 Testing Docker builds..."
echo "=========================="

echo "📦 Building backend..."
docker build -t conflict-backend ./backend
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

echo ""
echo "🎨 Building frontend..."
docker build -t conflict-frontend ./frontend
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "🎉 All builds successful! Ready to deploy."
echo ""
echo "Next steps:"
echo "1. Run: docker-compose up -d"
echo "2. Run: ./start.sh (for initialization)"
echo "3. Visit: http://localhost:3000"