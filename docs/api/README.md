# ShelfSpace API Documentation

## Overview

ShelfSpace is a microservices-based application for managing personal book libraries, reading lists, reviews, and reading groups. All services are accessed through an NGINX API Gateway.

## Architecture

```
┌─────────────────────────────────────┐
│      NGINX API Gateway (Port 80)    │
│         Rate Limiting: 10 req/s     │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐    ┌──────────▼──────────────────┐
│Frontend│    │   Backend Microservices      │
│ :3000  │    │                              │
└────────┘    │  User, Book, Review, Group,  │
              │  Library, Chat, Admin, etc.  │
              └──────────────────────────────┘
```

## Base URLs

- **Development:** `http://localhost/api`
- **Production:** `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

JWT tokens are obtained through the User Service `/api/me` endpoint after OAuth authentication.

## Rate Limiting

All API routes are rate-limited to **10 requests per second** per IP address, with a burst allowance of 20 requests.

## Common Response Formats

### Success Response
```json
{
  "id": "string",
  "data": {},
  ...
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {}
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Service-Specific Documentation

### User Service
**Base Path:** `/api/users`

- [User Service Docs](../services/user-service/user-service-docs.md)

**Endpoints:**
- `POST /api/me` - Login/Signup
- `GET /api/me` - Get current user profile
- `PATCH /api/me` - Update profile
- `GET /api/me/preferences` - Get preferences
- `PUT /api/me/preferences` - Update preferences
- `GET /api/me/stats` - Get user statistics
- `GET /api/:userId` - Get user by ID
- `POST /api/auth/verify` - Verify JWT token (internal)

### Book Service
**Base Path:** `/api/books`

- **Documentation:** See service documentation

**Endpoints:**
- `GET /api/books` - List books (paginated)
- `GET /api/books/:bookId` - Get book by ID
- `GET /api/books/search` - Search books
- `GET /api/books/genres` - Get all genres
- `GET /api/books/authors` - Get all authors
- `GET /api/books/languages` - Get all languages
- `POST /api/books` - Create book (admin)
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)

### Review Service
**Base Path:** `/api/reviews`

- [Review Service Docs](../services/review-service/review-service-docs.md)

**Endpoints:**
- `POST /api/reviews` - Create review (authenticated)
- `GET /api/reviews/book/:bookId` - Get reviews for a book
- `GET /api/reviews/user/:userId` - Get reviews by a user
- `GET /api/reviews/:id` - Get single review
- `PUT /api/reviews/:id` - Update review (owner only)
- `DELETE /api/reviews/:id` - Delete review (owner only)

### Group Service
**Base Path:** `/api/groups`

- [Group Service Docs](../services/group-service/group-service-docs.md)

**Endpoints:**
- `POST /api/groups` - Create group (authenticated)
- `GET /api/groups` - List groups (paginated)
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group (admin only)
- `DELETE /api/groups/:id` - Delete group (admin only)
- `POST /api/groups/:id/join` - Join group (authenticated)
- `POST /api/groups/:id/leave` - Leave group (authenticated)
- `GET /api/groups/:id/members` - Get group members
- `GET /api/groups/:groupId/members/:userId/verify` - Verify membership

### Library Service
**Base Path:** `/api/library`

- **Documentation:** See service documentation

**Endpoints:**
- `GET /api/library/reading-lists` - Get user's reading lists
- `POST /api/library/reading-lists` - Create reading list
- `PUT /api/library/reading-lists/:id` - Update reading list
- `DELETE /api/library/reading-lists/:id` - Delete reading list
- `POST /api/library/reading-lists/:id/move-books` - Move books between lists

**Note:** NGINX rewrites `/api/library/*` to `/*` before forwarding to the service.

### Chat Service
**Base Path:** `/api/chat`

- [Chat Service Docs](../services/chat-service/chat-service-docs.md)

**Endpoints:**
- `GET /api/chat/groups/:groupId/messages` - Get message history

**WebSocket:**
- **Path:** `/socket.io/`
- **Authentication:** Via JWT token in connection auth
- **Events:**
  - `join-room` - Join a group chat room
  - `message` - Send a message
  - `new-message` - Receive a new message

### Admin Service
**Base Path:** `/api/admin`

- [Admin Service Docs](../services/admin-service/admin-service-docs.md)

**Endpoints:** (Admin only)
- `POST /api/admin/moderation/log` - Log moderation action
- `GET /api/admin/moderation/logs` - Get moderation logs
- `PUT /api/admin/book-validation/:bookId` - Validate book
- `GET /api/admin/book-validation/:bookId` - Get validation status
- `PUT /api/admin/users/:userId/status` - Update user status
- `PUT /api/admin/users/:userId/preferences/reset` - Reset user preferences

### Chatbot Service
**Base Path:** `/api/chatbot`

- **Documentation:** See service documentation

**Endpoints:**
- `POST /api/chatbot/chat` - AI chat query
- `GET /api/chatbot/health` - Health check

**Note:** Extended timeout (300s read, 75s connect) for AI processing.

## WebSocket Connections

### Chat Service WebSocket

**Connection URL:** `ws://your-domain/socket.io/`

**Authentication:**
```javascript
const socket = io(url, {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

**Events:**
- `join-room` - Join a group chat room
  ```javascript
  socket.emit('join-room', { groupId: 'group-id' });
  ```
- `message` - Send a message
  ```javascript
  socket.emit('message', {
    groupId: 'group-id',
    text: 'Message text'
  });
  ```
- `new-message` - Receive a new message
  ```javascript
  socket.on('new-message', (message) => {
    console.log(message);
  });
  ```

## Pagination

Many endpoints support pagination via query parameters:

- `limit` - Number of items per page (default: 10)
- `offset` - Number of items to skip (default: 0)

Example:
```
GET /api/groups?limit=20&offset=0
```

## Error Handling

Always check the response status code and handle errors appropriately:

```javascript
try {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle error
}
```

## Testing

Integration tests are available in `tests/integration/`. See individual service documentation for specific endpoint details and examples.

## Support

For issues or questions, please refer to:
- Service-specific documentation in `services/*/.*-service-docs.md`
- Integration verification report: `INTEGRATION_PLAN_VERIFICATION.md`
- Backend audit report: `BACKEND_AUDIT_REPORT.md`

