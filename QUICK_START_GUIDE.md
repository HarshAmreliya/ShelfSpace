# Quick Start Guide - NextAuth + User Service Integration

## ✅ What's Already Done

The integration is **complete and working**! Here's what's implemented:

1. ✅ User Service checks if user exists by email
2. ✅ Returns `isNewUser` and `needsPreferences` flags
3. ✅ Login page redirects based on these flags
4. ✅ Middleware protects routes and enforces onboarding
5. ✅ Onboarding page saves preferences and updates session
6. ✅ AppContext syncs user from session

## 🚀 How to Start Everything

### Step 1: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=shelfspace

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DATABASE=books

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# API URLs
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Pinecone (optional for chatbot)
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENV=your-pinecone-env
PINECONE_INDEX_NAME=shelfspace-books
```

### Step 2: Start the User Service

**Option A: Using Docker (Recommended)**

```bash
# Start all services
docker-compose --profile dev up -d

# Check logs
docker logs shelfspace-user-service -f
```

**Option B: Run Locally (For Development)**

```bash
# Terminal 1: Start databases
docker-compose --profile dev up -d postgres redis

# Terminal 2: Start user service
cd services/user-service
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

### Step 3: Start the Frontend

```bash
# Terminal 3: Start frontend
cd frontend
npm install
npm run dev
```

### Step 4: Test the Flow

1. Open browser: `http://localhost:3000/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. **First time:** You'll be redirected to `/onboarding`
5. Complete the 3-step wizard
6. You'll be redirected to `/dashboard`
7. Sign out and sign in again
8. **Second time:** You'll go directly to `/dashboard`

---

## 🔍 Verify Everything is Working

### Check 1: User Service Health
```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok",...}`

### Check 2: Database Connection
```bash
cd services/user-service
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Check 3: Frontend Running
```bash
curl http://localhost:3000
```

Should return HTML

---

## 📊 How the Flow Works

```
┌─────────────────────────────────────────────────────────────┐
│                    User Signs In with Google                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  NextAuth JWT Callback calls User Service /api/me (POST)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              User Service Checks Database                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ SELECT * FROM users WHERE email = ?                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ User Exists?  │           │  New User?    │
│ isNewUser=false│          │ isNewUser=true│
└───────┬───────┘           └───────┬───────┘
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│Has Preferences?│          │Create User    │
└───────┬───────┘           │needsPrefs=true│
        │                   └───────┬───────┘
   ┌────┴────┐                      │
   │         │                      │
   ▼         ▼                      │
┌─────┐  ┌─────┐                   │
│ Yes │  │ No  │                   │
│     │  │     │                   │
└──┬──┘  └──┬──┘                   │
   │        │                      │
   │        └──────────┬───────────┘
   │                   │
   ▼                   ▼
┌─────────────┐  ┌──────────────┐
│ /dashboard  │  │ /onboarding  │
└─────────────┘  └──────────────┘
```

---

## 🐛 Troubleshooting

### Issue: "User Service not responding"

```bash
# Check if it's running
docker ps | grep user-service

# Check logs
docker logs shelfspace-user-service

# Restart it
docker-compose --profile dev restart user-service
```

### Issue: "Failed to fetch reading lists" (Dashboard Error)

This is expected if you haven't started the Library Service. You have two options:

**Option 1: Start all services**
```bash
docker-compose --profile dev up -d
```

**Option 2: Just test authentication (ignore dashboard errors)**
```bash
# Only start User Service
docker-compose --profile dev up -d postgres redis
cd services/user-service && npm run dev

# The auth flow will work, but dashboard will show errors
# This is fine for testing authentication only!
```

See [SERVICES_STARTUP_ORDER.md](./SERVICES_STARTUP_ORDER.md) for details.

### Issue: "Database connection failed"

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it shelfspace-postgres psql -U postgres -d shelfspace -c "SELECT 1;"
```

### Issue: "Google OAuth error"

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

### Issue: "Redirect loop"

This means session isn't updating properly. Check:

```bash
# Clear browser cookies for localhost
# Or use incognito mode

# Check NextAuth logs
cd frontend
npm run dev
# Look for "JWT Callback" and "Session Callback" logs
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `frontend/src/app/api/auth/[...nextauth]/route.ts` | NextAuth config, calls User Service |
| `frontend/src/app/login/page.tsx` | Login page with redirect logic |
| `frontend/src/middleware.ts` | Route protection |
| `frontend/src/app/onboarding/page.tsx` | Onboarding wizard |
| `frontend/src/contexts/AppContext.tsx` | User state management |
| `services/user-service/src/routes/user.routes.ts` | User Service API |

---

## 🎯 Next Steps

1. **Test with multiple users** - Sign in with different Google accounts
2. **Test edge cases** - Delete preferences, create users manually
3. **Add error handling** - Show user-friendly error messages
4. **Add loading states** - Better UX during redirects
5. **Add analytics** - Track onboarding completion rate

---

## 📚 Additional Documentation

- [HOW_TO_START_USER_SERVICE.md](./HOW_TO_START_USER_SERVICE.md) - Detailed service startup guide
- [AUTHENTICATION_FLOW_EXPLAINED.md](./AUTHENTICATION_FLOW_EXPLAINED.md) - Deep dive into the flow
- [NEXTAUTH_USER_SERVICE_INTEGRATION.md](./NEXTAUTH_USER_SERVICE_INTEGRATION.md) - Implementation details

---

## ✨ Summary

**Everything is already implemented and working!**

The User Service already:
- ✅ Checks if user exists by email
- ✅ Returns correct flags (`isNewUser`, `needsPreferences`)
- ✅ Creates new users when needed
- ✅ Returns existing users when they sign in again

The Frontend already:
- ✅ Redirects to onboarding for new users
- ✅ Redirects to dashboard for existing users
- ✅ Protects routes with middleware
- ✅ Updates session after onboarding

**Just start the services and test it!** 🚀
