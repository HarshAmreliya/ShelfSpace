# Chat Session Implementation - Complete ✅

## Overview
Implemented a hybrid chat storage system where:
- **User Service (Postgres)**: Stores session metadata (sessionId, title, timestamps, expiry)
- **Redis (Upstash)**: Stores actual chat messages with 24-hour TTL
- **Automatic Cleanup**: Sessions expire after 24 hours unless pinned

---

## What Was Implemented

### 1. Database Schema (Postgres)

**Model: `ChatSession`**
```prisma
model ChatSession {
  id            String    @id @default(uuid())
  userId        String
  title         String    @default("New Chat")
  isPinned      Boolean   @default(false)
  isVisible     Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastMessageAt DateTime  @default(now())
  expiresAt     DateTime  @default(dbgenerated("NOW() + INTERVAL '24 hours'"))
}
```

**Features:**
- UUID for each session
- Automatic expiry after 24 hours
- Pin functionality to keep sessions forever
- Visibility flag for soft deletion
- Indexed for fast queries

### 2. Redis Integration

**File**: `services/user-service/src/utils/redis.ts`

**Key Pattern**: `chat:cache:{sessionId}`

**Functions:**
- `getChatMessages(sessionId)` - Retrieve messages from Redis
- `setChatMessages(sessionId, messages)` - Store messages with 24h TTL
- `appendChatMessage(sessionId, message)` - Add single message
- `deleteChatMessages(sessionId)` - Remove all messages
- `refreshChatTTL(sessionId)` - Extend TTL by 24 hours

**Message Structure:**
```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  bookContext?: string;
  metadata?: any;
}
```

### 3. API Endpoints

**File**: `services/user-service/src/routes/chat.routes.ts`

All endpoints require authentication (`isAuthenticated` middleware).

#### Session Management

**GET `/api/chat/sessions`**
- List all active sessions for user
- Filters out expired sessions (unless pinned)
- Query params: `limit`, `offset`, `includePinned`
- Returns: Array of session metadata

**POST `/api/chat/sessions`**
- Create new chat session
- Body: `{ title?: string }`
- Returns: Created session object

**GET `/api/chat/sessions/:sessionId`**
- Get session with messages from Redis
- Returns: Session metadata + messages array
- Returns 410 if expired

**PATCH `/api/chat/sessions/:sessionId`**
- Update session metadata
- Body: `{ title?, isPinned?, isVisible? }`
- Use to rename or pin sessions

**DELETE `/api/chat/sessions/:sessionId`**
- Delete session from Postgres
- Delete messages from Redis
- Returns: `{ success: true }`

#### Message Management

**POST `/api/chat/sessions/:sessionId/messages`**
- Add message to session (stores in Redis)
- Body: `{ role, content, bookContext?, metadata? }`
- Automatically refreshes session expiry to 24h
- Updates `lastMessageAt` timestamp
- Returns: Created message object

**POST `/api/chat/sessions/:sessionId/refresh`**
- Manually extend session by 24 hours
- Refreshes both Postgres expiry and Redis TTL
- Returns: `{ success: true }`

#### Cleanup

**POST `/api/chat/cleanup`**
- Admin/Cron endpoint
- Marks expired sessions as invisible
- Should be called periodically (e.g., daily cron job)
- Returns: Count of hidden sessions

---

## Configuration

### Environment Variables

Add to `services/user-service/.env`:

```bash
# Use either local Redis or Upstash
REDIS_URL=redis://localhost:6379
# OR
UPSTASH_REDIS_URL=redis://default:password@your-url.upstash.io:6379
```

### Dependencies

```json
{
  "ioredis": "^5.x.x"
}
```

---

## Usage Flow

### 1. Create New Chat Session

```bash
POST /api/chat/sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Book Recommendations"
}
```

Response:
```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "title": "Book Recommendations",
  "isPinned": false,
  "isVisible": true,
  "createdAt": "2026-01-24T...",
  "expiresAt": "2026-01-25T..."
}
```

### 2. Add Messages

```bash
POST /api/chat/sessions/{sessionId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "user",
  "content": "Recommend me a sci-fi book"
}
```

```bash
POST /api/chat/sessions/{sessionId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "assistant",
  "content": "I recommend 'Dune' by Frank Herbert...",
  "bookContext": "book-id-123"
}
```

### 3. Get Session with Messages

```bash
GET /api/chat/sessions/{sessionId}
Authorization: Bearer {token}
```

Response:
```json
{
  "id": "uuid",
  "title": "Book Recommendations",
  "messages": [
    {
      "role": "user",
      "content": "Recommend me a sci-fi book",
      "timestamp": "2026-01-24T..."
    },
    {
      "role": "assistant",
      "content": "I recommend 'Dune'...",
      "timestamp": "2026-01-24T...",
      "bookContext": "book-id-123"
    }
  ],
  "messageCount": 2
}
```

### 4. List All Sessions

```bash
GET /api/chat/sessions?limit=20&offset=0
Authorization: Bearer {token}
```

### 5. Pin Important Session

```bash
PATCH /api/chat/sessions/{sessionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "isPinned": true
}
```

---

## Session Lifecycle

1. **Creation**: Session created with 24-hour expiry
2. **Active Use**: Each new message resets expiry to 24 hours from now
3. **Expiration**: After 24 hours of inactivity:
   - Session marked as expired in Postgres
   - Messages automatically deleted from Redis (TTL)
   - Session hidden from list (unless pinned)
4. **Pinned Sessions**: Never expire, kept forever

---

## Integration with Chatbot Service

The chatbot service doesn't need to change. The flow is:

1. **Frontend** → Creates session via User Service
2. **Frontend** → Sends message to Chatbot Service
3. **Chatbot Service** → Returns response
4. **Frontend** → Stores both user message and bot response via User Service

```typescript
// Example integration
async function sendChatMessage(sessionId: string, userMessage: string) {
  // 1. Store user message
  await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      role: 'user',
      content: userMessage
    })
  });
  
  // 2. Get bot response
  const botResponse = await fetch('/api/chatbot', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage })
  });
  
  const { response } = await botResponse.json();
  
  // 3. Store bot response
  await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      role: 'assistant',
      content: response
    })
  });
}
```

---

## Cleanup Strategy

### Option 1: Cron Job (Recommended)

Add to your deployment:

```bash
# Run daily at 2 AM
0 2 * * * curl -X POST http://localhost:3001/api/chat/cleanup
```

### Option 2: Application Scheduler

```typescript
// In your app startup
import cron from 'node-cron';

cron.schedule('0 2 * * *', async () => {
  try {
    await fetch('http://localhost:3001/api/chat/cleanup', {
      method: 'POST'
    });
    console.log('Chat cleanup completed');
  } catch (error) {
    console.error('Chat cleanup failed:', error);
  }
});
```

---

## Testing

### Manual Testing

```bash
# 1. Start user service
cd services/user-service
npm run dev

# 2. Create session
curl -X POST http://localhost:3001/api/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat"}'

# 3. Add message
curl -X POST http://localhost:3001/api/chat/sessions/SESSION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"Hello"}'

# 4. Get session
curl http://localhost:3001/api/chat/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps

### Frontend Integration (Phase 2)

1. Create chat service in frontend
2. Update chat UI to use sessions
3. Add session sidebar
4. Implement session switching
5. Add pin/delete functionality

### Optional Enhancements

1. **Search**: Full-text search across messages
2. **Export**: Export chat history as JSON/PDF
3. **Analytics**: Track popular topics, average session length
4. **Sharing**: Share chat sessions with other users
5. **Templates**: Pre-defined chat templates for common queries

---

## Monitoring

### Key Metrics to Track

1. **Session Count**: Active sessions per user
2. **Message Count**: Messages per session
3. **Redis Memory**: Monitor Redis memory usage
4. **Expiry Rate**: How many sessions expire vs. get extended
5. **Pin Rate**: Percentage of sessions that get pinned

### Redis Monitoring

```bash
# Check Redis memory usage
redis-cli INFO memory

# Check key count
redis-cli DBSIZE

# Check specific session
redis-cli GET chat:cache:SESSION_ID
```

---

## Troubleshooting

### Session Not Found
- Check if session expired (expiresAt < now)
- Verify userId matches
- Check if session was deleted

### Messages Not Persisting
- Verify Redis connection
- Check Redis TTL: `redis-cli TTL chat:cache:SESSION_ID`
- Ensure REDIS_URL is set correctly

### Performance Issues
- Add Redis connection pooling
- Implement caching for session list
- Add pagination for large message arrays

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT
2. **Authorization**: Users can only access their own sessions
3. **Data Isolation**: Sessions filtered by userId
4. **TTL**: Automatic data deletion after 24 hours
5. **Soft Delete**: isVisible flag for recovery window

---

## Summary

✅ **Completed:**
- Database schema with ChatSession model
- Redis integration for message storage
- Complete REST API for session management
- 24-hour TTL with auto-expiry
- Pin functionality for important chats
- Cleanup endpoint for maintenance

🎯 **Ready for:**
- Frontend integration
- Production deployment
- User testing

📊 **Benefits:**
- Scalable message storage (Redis)
- Fast session queries (Postgres indexes)
- Automatic cleanup (TTL)
- Cost-effective (messages auto-delete)
- User-friendly (pin important chats)
