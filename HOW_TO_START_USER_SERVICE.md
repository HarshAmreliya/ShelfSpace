# How to Start the User Service

## Quick Start (Recommended)

### Option 1: Using Docker Compose (Easiest)

This starts all services including databases and the user service:

```bash
# 1. Make sure you have a .env file with required variables
cp .env.example .env  # If you don't have one

# 2. Start all services with Docker
docker-compose --profile dev up -d

# 3. Check if user service is running
docker logs shelfspace-user-service
```

The user service will be available at: `http://localhost:3001`

### Option 2: Run User Service Locally (Development)

This is better for active development:

```bash
# 1. Start only the databases with Docker
docker-compose --profile dev up -d postgres redis

# 2. Navigate to user service directory
cd services/user-service

# 3. Install dependencies (if not already done)
npm install

# 4. Set up environment variables
# Create a .env file in services/user-service/ with:
cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/shelfspace
JWT_SECRET=your-jwt-secret-key-here
LIBRARY_SERVICE_URL=http://localhost:3003
REDIS_URL=redis://localhost:6379
EOF

# 5. Generate Prisma client
npm run db:generate

# 6. Run database migrations
npm run db:migrate

# 7. Start the service in development mode
npm run dev
```

The user service will be available at: `http://localhost:3001`

---

## Environment Variables Required

Create a `.env` file in the root directory with these variables:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=shelfspace

# MongoDB (for book service)
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DATABASE=books

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth (for frontend)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# API URLs
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Pinecone (for chatbot)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENV=your-pinecone-environment
PINECONE_INDEX_NAME=shelfspace-books
```

---

## Verify User Service is Running

### 1. Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-23T..."
}
```

### 2. Check API Endpoints
```bash
# Test the /me endpoint (requires authentication)
curl http://localhost:3001/api/me \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

---

## Common Issues & Solutions

### Issue 1: Database Connection Error
```
Error: Can't reach database server at `localhost:5432`
```

**Solution:**
```bash
# Make sure PostgreSQL is running
docker-compose --profile dev up -d postgres

# Check if it's healthy
docker ps | grep postgres
```

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process or change the port in .env
PORT=3011 npm run dev
```

### Issue 3: Prisma Client Not Generated
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd services/user-service
npm run db:generate
```

### Issue 4: Migration Errors
```
Error: Migration failed
```

**Solution:**
```bash
# Reset the database (WARNING: This deletes all data)
cd services/user-service
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name init
```

---

## Development Workflow

### 1. Start Development Environment
```bash
# Terminal 1: Start databases
docker-compose --profile dev up -d postgres redis

# Terminal 2: Start user service
cd services/user-service
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### 2. View Database
```bash
cd services/user-service
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555` where you can view and edit database records.

### 3. Run Tests
```bash
cd services/user-service
npm test
```

---

## API Endpoints

Once running, the User Service provides these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/me` | Create or get user (used by NextAuth) |
| GET | `/api/me` | Get current user profile |
| PATCH | `/api/me` | Update user profile |
| GET | `/api/me/preferences` | Get user preferences |
| PUT | `/api/me/preferences` | Update user preferences |
| GET | `/api/me/stats` | Get user statistics |
| GET | `/api/:userId` | Get user by ID (public profiles) |

---

## Next Steps

After starting the User Service:

1. ✅ Start the frontend: `cd frontend && npm run dev`
2. ✅ Test the login flow at `http://localhost:3000/login`
3. ✅ Sign in with Google
4. ✅ Verify user is created in the database (use Prisma Studio)
5. ✅ Check onboarding redirect works correctly

---

## Stopping Services

### Stop Docker services:
```bash
docker-compose --profile dev down
```

### Stop local development:
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### Stop and remove all data:
```bash
docker-compose --profile dev down -v
```
