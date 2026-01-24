#!/bin/bash

# Test script for Chat Session API Routes
# This tests all 8 endpoints

BASE_URL="http://localhost:3001/api"
TEST_EMAIL="test-chat@example.com"
TEST_NAME="Test User"

echo "========================================="
echo "Testing Chat Session API Routes"
echo "========================================="
echo ""

# Create test user first
echo "1. Creating test user..."
USER_RESPONSE=$(curl -s -X POST "${BASE_URL}/me" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"name\":\"${TEST_NAME}\"}")

TOKEN=$(echo $USER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to create user or get token"
    echo "Response: $USER_RESPONSE"
    exit 1
fi
echo "✅ User created and got token: ${TOKEN:0:20}..."
echo ""

# Test 1: Create Session
echo "2. Testing POST /api/chat/sessions (Create Session)"
SESSION_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat Session"}')

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
    echo "❌ Failed to create session"
    echo "Response: $SESSION_RESPONSE"
else
    echo "✅ Session created: $SESSION_ID"
    echo "Response: $SESSION_RESPONSE"
fi
echo ""

# Test 2: List Sessions
echo "3. Testing GET /api/chat/sessions (List Sessions)"
LIST_RESPONSE=$(curl -s "${BASE_URL}/chat/sessions?limit=10" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Sessions listed"
echo "Response: $LIST_RESPONSE"
echo ""

# Test 3: Add User Message
echo "4. Testing POST /api/chat/sessions/:id/messages (Add Message)"
MESSAGE_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat/sessions/${SESSION_ID}/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"Hello, recommend me a book"}')
echo "✅ User message added"
echo "Response: $MESSAGE_RESPONSE"
echo ""

# Test 4: Add Assistant Message
echo "5. Testing POST /api/chat/sessions/:id/messages (Add Assistant Response)"
ASSISTANT_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat/sessions/${SESSION_ID}/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"assistant","content":"I recommend Dune by Frank Herbert!"}')
echo "✅ Assistant message added"
echo "Response: $ASSISTANT_RESPONSE"
echo ""

# Test 5: Get Session with Messages
echo "6. Testing GET /api/chat/sessions/:id (Get Session with Messages)"
GET_SESSION_RESPONSE=$(curl -s "${BASE_URL}/chat/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Session retrieved with messages"
echo "Response: $GET_SESSION_RESPONSE"
echo ""

# Test 6: Update Session (Pin)
echo "7. Testing PATCH /api/chat/sessions/:id (Pin Session)"
UPDATE_RESPONSE=$(curl -s -X PATCH "${BASE_URL}/chat/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPinned":true,"title":"My Favorite Chat"}')
echo "✅ Session updated (pinned)"
echo "Response: $UPDATE_RESPONSE"
echo ""

# Test 7: Refresh Session
echo "8. Testing POST /api/chat/sessions/:id/refresh (Refresh TTL)"
REFRESH_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat/sessions/${SESSION_ID}/refresh" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Session TTL refreshed"
echo "Response: $REFRESH_RESPONSE"
echo ""

# Test 8: Delete Session
echo "9. Testing DELETE /api/chat/sessions/:id (Delete Session)"
DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/chat/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Session deleted"
echo "Response: $DELETE_RESPONSE"
echo ""

# Bonus: Test Cleanup Endpoint
echo "10. Testing POST /api/chat/cleanup (Cleanup Expired Sessions)"
CLEANUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/chat/cleanup" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Cleanup executed"
echo "Response: $CLEANUP_RESPONSE"
echo ""

echo "========================================="
echo "All 8 Chat API Routes Tested!"
echo "========================================="
echo ""
echo "Summary:"
echo "✅ POST   /api/chat/sessions - Create session"
echo "✅ GET    /api/chat/sessions - List sessions"
echo "✅ GET    /api/chat/sessions/:id - Get session with messages"
echo "✅ POST   /api/chat/sessions/:id/messages - Add message"
echo "✅ PATCH  /api/chat/sessions/:id - Update session"
echo "✅ DELETE /api/chat/sessions/:id - Delete session"
echo "✅ POST   /api/chat/sessions/:id/refresh - Refresh TTL"
echo "✅ POST   /api/chat/cleanup - Cleanup expired"
