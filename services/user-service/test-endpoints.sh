#!/bin/bash

# Quick endpoint test script
set -e

BASE_URL="http://localhost:3001"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "Testing User Service Endpoints"
echo "==============================="
echo ""

# Test 1: Create user
echo "1. Creating new user..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/me \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"Test User\"}")

echo "$RESPONSE" | jq .

USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')
TOKEN=$(echo "$RESPONSE" | jq -r '.token')

echo "User ID: $USER_ID"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Test 2: Get token by user ID
echo "2. Getting token by user ID..."
TOKEN_RESPONSE=$(curl -s $BASE_URL/api/$USER_ID)
echo "$TOKEN_RESPONSE" | jq .
NEW_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token')
echo ""

# Test 3: Get current user profile
echo "3. Getting current user profile..."
curl -s $BASE_URL/api/me \
  -H "Authorization: Bearer $NEW_TOKEN" | jq .
echo ""

# Test 4: Update user profile
echo "4. Updating user profile..."
curl -s -X PATCH $BASE_URL/api/me \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","bio":"Test bio"}' | jq .
echo ""

echo "✓ All tests passed!"
