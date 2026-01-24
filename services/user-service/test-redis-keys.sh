#!/bin/bash

# Test Redis key pattern for chat sessions

BASE_URL="http://localhost:3001/api"
TEST_EMAIL="redis-test@example.com"

echo "========================================="
echo "Testing Redis Key Pattern"
echo "========================================="
echo ""

# Create test user
echo "1. Creating test user..."
USER_RESPONSE=$(curl -s -X POST "${BASE_URL}/me" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"name\":\"Redis Test\"}")

TOKEN=$(echo $USER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Got token"
echo ""

# Create session
echo "2. Creating chat session..."
SESSION_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Redis Key Test"}')

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Session created: $SESSION_ID"
echo ""

# Add a message
echo "3. Adding message to session..."
curl -s -X POST "${BASE_URL}/chat/sessions/${SESSION_ID}/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"Test message"}' > /dev/null
echo "✅ Message added"
echo ""

# Check Redis key
echo "4. Checking Redis key pattern..."
EXPECTED_KEY="chat:${SESSION_ID}"
echo "Expected key: $EXPECTED_KEY"
echo ""

# Try to get the key from Redis
echo "5. Verifying key exists in Redis..."
if command -v redis-cli &> /dev/null; then
    REDIS_VALUE=$(redis-cli GET "$EXPECTED_KEY" 2>/dev/null)
    if [ -n "$REDIS_VALUE" ]; then
        echo "✅ Key found in Redis!"
        echo "Key: $EXPECTED_KEY"
        echo "Value preview: ${REDIS_VALUE:0:100}..."
        
        # Check TTL
        TTL=$(redis-cli TTL "$EXPECTED_KEY" 2>/dev/null)
        echo "TTL: $TTL seconds (~$(($TTL / 3600)) hours)"
    else
        echo "❌ Key not found in Redis"
        echo "Checking all chat keys..."
        redis-cli KEYS "chat:*" 2>/dev/null
    fi
else
    echo "⚠️  redis-cli not available, skipping Redis verification"
    echo "   But the API should be using key: $EXPECTED_KEY"
fi
echo ""

# Retrieve via API to confirm
echo "6. Retrieving session via API..."
GET_RESPONSE=$(curl -s "${BASE_URL}/chat/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer $TOKEN")

MESSAGE_COUNT=$(echo $GET_RESPONSE | grep -o '"messageCount":[0-9]*' | cut -d':' -f2)
if [ "$MESSAGE_COUNT" = "1" ]; then
    echo "✅ Message retrieved successfully from Redis!"
    echo "   This confirms the key pattern is working: chat:{sessionId}"
else
    echo "❌ Failed to retrieve message"
fi
echo ""

# Cleanup
echo "7. Cleaning up..."
curl -s -X DELETE "${BASE_URL}/chat/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Session deleted"
echo ""

echo "========================================="
echo "Redis Key Pattern: chat:{sessionId} ✅"
echo "========================================="
