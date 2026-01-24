# Services Startup Order & Dependencies

## Current Status

✅ **User Service Integration** - Complete and working
❌ **Library Service** - Not started (causes dashboard errors)
❌ **Other Services** - Not started

## The Error You're Seeing

```
ServiceError: Failed to fetch reading lists
```

This happens because the **Library Service** isn't running. The dashboard tries to fetch reading lists on load, but the service isn't available.

## Quick Fix Options

### Option 1: Start All Services (Recommended)

Start everything with Docker:

```bash
docker-compose --profile dev up -d
```

This starts:
- PostgreSQL (database)
- MongoDB (for books)
- Redis (caching)
- User Service (port 3001) ✅
- Library Service (port 3003) ← Needed for dashboard
- Book Service (port 3004)
- Review Service (port 3002)
- Group Service (port 3005)
- Chat Service (port 3006)
- Admin Service (port 3007)

### Option 2: Start Only Required Services

If you only want to test authentication:

```bash
# Start databases
docker-compose --profile dev up -d postgres redis

# Start User Service
cd services/user-service
npm run dev

# Start Library Service (for dashboard)
cd services/user-library-service
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

### Option 3: Disable Dashboard Features Temporarily

You can skip the dashboard and just test the authentication flow:

1. Sign in at `/login`
2. Complete onboarding at `/onboarding`
3. You'll be redirected to `/dashboard` but it will show errors
4. This is expected - the auth flow still works!

## Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│                    http://localhost:3000                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
┌──────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
│ User Service │ │ Library  │ │  Book   │ │  Review  │
│   :3001      │ │ Service  │ │ Service │ │ Service  │
│              │ │  :3003   │ │  :3004  │ │  :3002   │
└──────┬───────┘ └────┬─────┘ └────┬────┘ └────┬─────┘
       │              │            │           │
       ▼              ▼            ▼           ▼
┌──────────────┐ ┌──────────────────────────────┐
│  PostgreSQL  │ │         MongoDB              │
│    :5432     │ │          :27017              │
└──────────────┘ └──────────────────────────────┘
```

### What Each Service Does:

1. **User Service** (Required for auth)
   - User authentication
   - User profiles
   - User preferences
   - User statistics

2. **Library Service** (Required for dashboard)
   - Reading lists (Currently Reading, Want to Read, etc.)
   - Book organization
   - Reading progress

3. **Book Service** (Required for book data)
   - Book catalog
   - Book metadata
   - Book search

4. **Review Service** (Optional)
   - Book reviews
   - Ratings

5. **Group Service** (Optional)
   - Reading groups
   - Group discussions

6. **Chat Service** (Optional)
   - Real-time chat
   - Group messaging

7. **Admin Service** (Optional)
   - Admin dashboard
   - User management

## Testing Authentication Without Full Stack

If you just want to test the authentication flow:

1. ✅ Start User Service (required)
2. ✅ Start Frontend
3. ❌ Skip other services

**What works:**
- ✅ Login with Google
- ✅ User creation in User Service
- ✅ Redirect to onboarding (new users)
- ✅ Redirect to dashboard (existing users)
- ✅ Onboarding flow
- ✅ Preferences saving

**What doesn't work:**
- ❌ Dashboard content (needs Library Service)
- ❌ Book browsing (needs Book Service)
- ❌ Reviews (needs Review Service)
- ❌ Groups (needs Group Service)

## Environment Variables for All Services

Create `.env` in root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=shelfspace

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DATABASE=books

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Service URLs (for Docker)
USER_SERVICE_URL=http://user-service:3001
LIBRARY_SERVICE_URL=http://user-library-service:3003
BOOK_SERVICE_URL=http://book-service:3004
REVIEW_SERVICE_URL=http://review-service:3002

# Service URLs (for local development)
# USER_SERVICE_URL=http://localhost:3001
# LIBRARY_SERVICE_URL=http://localhost:3003
# BOOK_SERVICE_URL=http://localhost:3004
# REVIEW_SERVICE_URL=http://localhost:3002
```

## Quick Commands

### Start Everything
```bash
docker-compose --profile dev up -d
```

### Start Only Auth Services
```bash
docker-compose --profile dev up -d postgres redis
cd services/user-service && npm run dev
```

### Check Service Status
```bash
# Check if services are running
docker ps

# Check specific service logs
docker logs shelfspace-user-service
docker logs shelfspace-library-service

# Check service health
curl http://localhost:3001/health  # User Service
curl http://localhost:3003/health  # Library Service
```

### Stop Everything
```bash
docker-compose --profile dev down
```

## Summary

**For authentication testing only:**
- Start User Service ✅
- Start Frontend ✅
- Ignore dashboard errors ✅

**For full functionality:**
- Start all services with Docker ✅
- Or start services individually as needed ✅

The authentication integration is **complete and working** - the dashboard errors are just because other services aren't running yet!
