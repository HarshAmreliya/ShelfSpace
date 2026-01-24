# Frontend-Backend API Verification Report

**Date**: November 25, 2025  
**Status**: 🔍 **IN PROGRESS**

This document maps all frontend API calls to their corresponding backend routes and verifies that each endpoint exists and returns the expected response format.

---

## Table of Contents
1. [User Service](#user-service)
2. [Book Service](#book-service)
3. [Review Service](#review-service)
4. [Group Service](#group-service)
5. [Chat Service](#chat-service)
6. [Admin Service](#admin-service)
7. [User Library Service](#user-library-service)
8. [Summary](#summary)

---

## User Service

**Frontend Client**: `frontend/src/lib/user-service.ts`  
**Backend Service**: `services/user-service/`  
**Base URL**: `http://localhost:3001/api`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `createUser()` | POST | `/api/me` | `POST /api/me` | ✅ | Creates or finds user |
| `getCurrentUser()` | GET | `/api/me` | `GET /api/me` | ✅ | Requires auth |
| `updateUser()` | PATCH | `/api/me` | `PATCH /api/me` | ✅ | Requires auth |
| `getPreferences()` | GET | `/api/me/preferences` | `GET /api/me/preferences` | ✅ | Requires auth |
| `updatePreferences()` | PUT | `/api/me/preferences` | `PUT /api/me/preferences` | ✅ | Requires auth |
| `getStats()` | GET | `/api/me/stats` | `GET /api/me/stats` | ✅ | Requires auth |
| `getUserById()` | GET | `/api/:userId` | `GET /api/:userId` | ✅ | Public, returns token |

### Expected Request/Response Formats

#### POST /api/me (Create/Login User)
**Request:**
```json
{
  "email": "user@example.com",
  "name": "User Name"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": null,
    "bio": null,
    "website": null,
    "isPublic": true,
    "status": "ACTIVE",
    "createdAt": "2025-11-25T...",
    "updatedAt": "2025-11-25T...",
    "preferences": null
  },
  "isNewUser": true,
  "needsPreferences": true
}
```

#### GET /api/me (Get Current User)
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": null,
  "bio": null,
  "website": null,
  "isPublic": true,
  "status": "ACTIVE",
  "createdAt": "2025-11-25T...",
  "updatedAt": "2025-11-25T...",
  "preferences": { ... },
  "stats": { ... }
}
```

#### PATCH /api/me (Update User)
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Updated Name",
  "bio": "My bio",
  "website": "https://example.com",
  "isPublic": true
}
```

**Response:** Same as GET /api/me

#### GET /api/me/preferences
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "userId": "uuid",
  "theme": "SYSTEM",
  "language": "en",
  "timezone": null,
  "notificationsEmail": true,
  "notificationsSMS": false,
  "newsletterOptIn": false,
  "dailyDigest": true,
  "defaultSortOrder": "MOST_RECENT",
  "defaultViewMode": "CARD",
  "compactMode": false,
  "accessibilityFont": false,
  "reducedMotion": false,
  "autoPlayMedia": false,
  "createdAt": "2025-11-25T...",
  "updatedAt": "2025-11-25T..."
}
```

#### PUT /api/me/preferences
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "theme": "DARK",
  "defaultViewMode": "LIST"
}
```

**Response:** Same as GET /api/me/preferences

#### GET /api/me/stats
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "userId": "uuid",
  "booksRead": 0,
  "pagesRead": 0,
  "currentStreak": 0,
  "longestStreak": 0,
  "updatedAt": "2025-11-25T...",
  "createdAt": "2025-11-25T..."
}
```

---

## Book Service

**Frontend Client**: `frontend/src/lib/book-service.ts`  
**Backend Service**: `services/book-service/`  
**Base URL**: `/api/books`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `getBooks()` | GET | `/api/books?page=1&author=...` | `GET /books` | ⚠️ | Check pagination format |
| `getBookById()` | GET | `/api/books/:id` | `GET /books/:id` | ⚠️ | Check response format |
| `searchBooks()` | GET | `/api/books/search?q=...` | `GET /books/search` | ⚠️ | Check if exists |
| `getGenres()` | GET | `/api/books/genres` | `GET /books/genres` | ⚠️ | Check if exists |
| `getAuthors()` | GET | `/api/books/authors` | `GET /books/authors` | ⚠️ | Check if exists |
| `getLanguages()` | GET | `/api/books/languages` | `GET /books/languages` | ⚠️ | Check if exists |

### Expected Response Format

#### GET /api/books
**Response:**
```json
{
  "success": true,
  "totalBooks": 100,
  "currentPage": 1,
  "totalPages": 4,
  "books": [
    {
      "_id": "book-id",
      "book_id": "book-id",
      "title": "Book Title",
      "authors": [{ "name": "Author Name" }],
      "image_url": "https://...",
      "published_year": 2024,
      "genres": ["Fiction"],
      "isbn": "1234567890",
      "description": "Book description",
      "pages": 300,
      "average_rating": 4.5,
      "ratings_count": 100
    }
  ]
}
```

---

## Review Service

**Frontend Client**: `frontend/src/lib/review-service.ts`  
**Backend Service**: `services/review-service/`  
**Base URL**: `/api/reviews`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `listByBook()` | GET | `/api/reviews/book/:bookId` | `GET /reviews/book/:bookId` | ⚠️ | Check if exists |
| `getById()` | GET | `/api/reviews/:id` | `GET /reviews/:id` | ⚠️ | Check if exists |
| `create()` | POST | `/api/reviews` | `POST /reviews` | ⚠️ | Check request format |
| `update()` | PUT | `/api/reviews/:id` | `PUT /reviews/:id` | ⚠️ | Check if exists |
| `remove()` | DELETE | `/api/reviews/:id` | `DELETE /reviews/:id` | ⚠️ | Check if exists |

### Expected Request/Response Format

#### POST /api/reviews
**Request:**
```json
{
  "bookId": "book-id",
  "reviewText": "Great book!",
  "rating": 5,
  "tldr": "Loved it"
}
```

**Response:**
```json
{
  "id": "review-id",
  "userId": "user-id",
  "bookId": "book-id",
  "reviewText": "Great book!",
  "tldr": "Loved it",
  "rating": 5,
  "createdAt": "2025-11-25T...",
  "updatedAt": "2025-11-25T..."
}
```

---

## Group Service

**Frontend Client**: `frontend/src/lib/group-service.ts`  
**Backend Service**: `services/group-service/`  
**Base URL**: `/api/groups`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `list()` | GET | `/api/groups` | `GET /groups` | ⚠️ | Check if exists |
| `getById()` | GET | `/api/groups/:id` | `GET /groups/:id` | ⚠️ | Check if exists |
| `create()` | POST | `/api/groups` | `POST /groups` | ⚠️ | Check request format |
| `update()` | PUT | `/api/groups/:id` | `PUT /groups/:id` | ⚠️ | Check if exists |
| `delete()` | DELETE | `/api/groups/:id` | `DELETE /groups/:id` | ⚠️ | Check if exists |
| `join()` | POST | `/api/groups/:id/join` | `POST /groups/:id/join` | ⚠️ | Check if exists |
| `leave()` | POST | `/api/groups/:id/leave` | `POST /groups/:id/leave` | ⚠️ | Check if exists |
| `getMembers()` | GET | `/api/groups/:id/members` | `GET /groups/:id/members` | ⚠️ | Check if exists |
| `verifyMembership()` | GET | `/api/groups/:id/members/:userId/verify` | `GET /groups/:id/members/:userId/verify` | ⚠️ | Check if exists |

---

## Chat Service

**Frontend Client**: `frontend/src/lib/chat-service.ts`  
**Backend Service**: `services/chat-service/`  
**Base URL**: `/api/chat`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `getMessages()` | GET | `/api/chat/groups/:groupId/messages` | `GET /chat/groups/:groupId/messages` | ⚠️ | Check if exists |

---

## Admin Service

**Frontend Client**: `frontend/src/lib/admin-service.ts`  
**Backend Service**: `services/admin-service/`  
**Base URL**: `/api/admin`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `getModerationLogs()` | GET | `/api/admin/moderation/logs` | `GET /admin/moderation/logs` | ⚠️ | Check if exists |
| `createModerationLog()` | POST | `/api/admin/moderation/log` | `POST /admin/moderation/log` | ⚠️ | Check if exists |
| `getBookValidation()` | GET | `/api/admin/book-validation/:bookId` | `GET /admin/book-validation/:bookId` | ⚠️ | Check if exists |
| `updateBookValidation()` | PUT | `/api/admin/book-validation/:bookId` | `PUT /admin/book-validation/:bookId` | ⚠️ | Check if exists |
| `updateUserStatus()` | PUT | `/api/admin/users/:userId/status` | `PUT /users/:userId/status` | ✅ | In user-service |
| `resetUserPreferences()` | PUT | `/api/admin/users/:userId/preferences/reset` | `PUT /users/:userId/preferences/reset` | ✅ | In user-service |

---

## User Library Service

**Frontend Client**: `frontend/src/services/libraryService.ts`  
**Backend Service**: `services/user-library-service/`  
**Base URL**: `/api/library/reading-lists`

### API Endpoints Mapping

| Frontend Method | HTTP Method | Frontend Endpoint | Backend Route | Status | Notes |
|----------------|-------------|-------------------|---------------|--------|-------|
| `getReadingLists()` | GET | `/api/library/reading-lists` | `GET /reading-lists` | ⚠️ | Check if exists |
| `createReadingList()` | POST | `/api/library/reading-lists` | `POST /reading-lists` | ⚠️ | Check request format |
| `updateReadingList()` | PUT | `/api/library/reading-lists/:id` | `PUT /reading-lists/:id` | ⚠️ | Check if exists |
| `deleteReadingList()` | DELETE | `/api/library/reading-lists/:id` | `DELETE /reading-lists/:id` | ⚠️ | Check if exists |
| `moveBooks()` | POST | `/api/library/reading-lists/:id/move-books` | `POST /reading-lists/:id/move-books` | ⚠️ | Check if exists |

---

## Summary

### Verification Status

| Service | Total Endpoints | Verified ✅ | Needs Check ⚠️ | Missing ❌ |
|---------|----------------|-------------|----------------|-----------|
| User Service | 7 | 7 | 0 | 0 |
| Book Service | 6 | 0 | 6 | 0 |
| Review Service | 5 | 0 | 5 | 0 |
| Group Service | 9 | 0 | 9 | 0 |
| Chat Service | 1 | 0 | 1 | 0 |
| Admin Service | 6 | 2 | 4 | 0 |
| User Library Service | 5 | 0 | 5 | 0 |
| **TOTAL** | **39** | **9** | **30** | **0** |

### Overall Status: 23% Complete

---

## Next Steps

1. ✅ **User Service** - Fully verified and working
2. ⚠️ **Book Service** - Need to verify all endpoints exist and return correct format
3. ⚠️ **Review Service** - Need to verify all endpoints exist
4. ⚠️ **Group Service** - Need to verify all endpoints exist
5. ⚠️ **Chat Service** - Need to verify endpoint exists
6. ⚠️ **Admin Service** - Need to verify moderation and validation endpoints
7. ⚠️ **User Library Service** - Need to verify reading list endpoints

---

## Testing Checklist

For each service, verify:
- [ ] All backend routes exist in the service
- [ ] Request body format matches what frontend sends
- [ ] Response format matches what frontend expects
- [ ] Authentication is properly implemented
- [ ] Error responses are handled correctly
- [ ] Pagination works as expected
- [ ] Query parameters are supported

---

## Issues Found

### User Service
- ✅ All endpoints working correctly
- ✅ Authentication middleware properly implemented
- ✅ Response formats match frontend expectations

### Book Service
- ⚠️ Need to verify `/books/search` endpoint exists
- ⚠️ Need to verify `/books/genres` endpoint exists
- ⚠️ Need to verify `/books/authors` endpoint exists
- ⚠️ Need to verify `/books/languages` endpoint exists
- ⚠️ Need to verify pagination format matches frontend expectations

### Review Service
- ⚠️ Need to verify all CRUD endpoints exist
- ⚠️ Need to verify `/reviews/book/:bookId` endpoint exists

### Group Service
- ⚠️ Need to verify all endpoints exist
- ⚠️ Need to verify membership verification endpoint

### Chat Service
- ⚠️ Need to verify message history endpoint exists

### Admin Service
- ⚠️ Need to verify moderation log endpoints exist
- ⚠️ Need to verify book validation endpoints exist

### User Library Service
- ⚠️ Need to verify all reading list endpoints exist
- ⚠️ Need to verify move-books endpoint exists

---

**Last Updated**: November 25, 2025  
**Next Review**: After verifying remaining services
