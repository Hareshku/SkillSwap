#!/bin/bash

echo "🔐 Testing admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@growtogather.com","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token (this is a simple extraction, might need adjustment)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:50}..."

echo ""
echo "📋 Getting posts..."
POSTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/admin/posts?page=1&limit=5)
echo "Posts response: $POSTS_RESPONSE"

echo ""
echo "🧪 Testing post moderation (remove post ID 3)..."
MODERATE_RESPONSE=$(curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"remove","reason":"Test removal via curl"}' \
  http://localhost:3001/api/admin/posts/3/moderate)

echo "Moderation response: $MODERATE_RESPONSE"

echo ""
echo "🔄 Testing post restoration (approve post ID 3)..."
RESTORE_RESPONSE=$(curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","reason":"Test restoration via curl"}' \
  http://localhost:3001/api/admin/posts/3/moderate)

echo "Restoration response: $RESTORE_RESPONSE"

echo ""
echo "🎉 Test completed!"
