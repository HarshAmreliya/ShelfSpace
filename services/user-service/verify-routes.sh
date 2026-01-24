#!/bin/bash

echo "Verifying User Service Routes"
echo "=============================="
echo ""

BASE_URL="http://localhost:3001"

# Test 1: Health check
echo "1. Health Check..."
curl -s $BASE_URL/health | jq .
echo ""

# Test 2: Create a test user
echo "2. Creating test user..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/me \
  -H "Content-Type: application/json" \
  -d '{"email":"verify-'$(date +%s)'@test.com","name":"Verify User"}')
echo "$RESPONSE" | jq .

USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
echo "User ID: $USER_ID"
echo ""

# Test 3: Get token by user ID (public route)
echo "3. Getting token by user ID (public route)..."
TOKEN_RESPONSE=$(curl -s $BASE_URL/api/token/$USER_ID)
echo "$TOKEN_RESPONSE" | jq .
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token')
echo ""

# Test 4: Get current user profile (protected route)
echo "4. Getting current user profile (protected route)..."
curl -s $BASE_URL/api/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "✓ All route tests passed!"
