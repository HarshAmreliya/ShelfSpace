# Admin Service - Complete Startup & Testing Guide

This guide walks you through starting the admin service and running Newman tests.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Starting the Service](#starting-the-service)
3. [Running Newman Tests](#running-newman-tests)
4. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- Docker & Docker Compose
- Node.js (v14+) and npm
- PostgreSQL (if running locally without Docker)

### Required Environment Variables

Create a `.env` file in the project root with:

```bash
# Database
POSTGRES_USER=shelfspace
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=shelfspace

# MongoDB (for book service)
MONGO_USER=shelfspace
MONGO_PASSWORD=your_mongo_password
MONGO_DATABASE=books

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth (for frontend)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Pinecone (for chatbot)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENV=your_pinecone_env
PINECONE_INDEX_NAME=shelfspace-books

# URLs
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

---

## Starting the Service

### Option 1: Using Docker Compose (Recommended)

#### Start All Services

```bash
# From project root
docker-compose --profile dev up -d
```

#### Start Only Admin Service Dependencies

```bash
# Start database and user service (admin service depends on these)
docker-compose up -d postgres user-service

# Wait for services to be healthy
docker-compose ps

# Start admin service
docker-compose up -d admin-service
```

#### Check Service Status

```bash
# View all running services
docker-compose ps

# Check admin service logs
docker-compose logs -f admin-service

# Check if admin service is healthy
curl http://localhost/api/admin/../../health
# or directly:
curl http://localhost:3007/health
```

### Option 2: Running Locally (Development)

#### 1. Setup Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Or use your local PostgreSQL instance
```

#### 2. Configure Environment

```bash
cd services/admin-service

# Copy and edit .env file
cp .env.example .env

# Edit .env with your local settings:
# DATABASE_URL=postgresql://shelfspace:password@localhost:5432/shelfspace
# USER_SERVICE_URL=http://localhost:3001
# PORT=3007
# NODE_ENV=development
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

#### 5. Start the Service

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

#### 6. Verify Service is Running

```bash
# Check health endpoint
curl http://localhost:3007/health

# Expected response:
# {"status":"ok","service":"admin-service"}
```

---

## Running Newman Tests

### Quick Start (Automatic Everything!)

The easiest way - just run:

```bash
cd services/admin-service
chmod +x test-api.sh
./test-api.sh
```

This script will:

- ✅ Install Newman if needed
- ✅ Create configuration file
- ✅ Auto-login to get JWT token
- ✅ Run all tests
- ✅ Generate HTML report

### Manual Setup

#### 1. Install Newman

```bash
npm install -g newman newman-reporter-htmlextra
```

#### 2. Configure Credentials

Create `.env.newman` file:

```bash
cd services/admin-service

cat > .env.newman << 'EOF'
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
USER_SERVICE_URL=http://localhost/api/users
ADMIN_SERVICE_URL=http://localhost/api/admin
EOF
```

**Important**: Update with your actual admin credentials!

#### 3. Run Tests

**Option A: Automatic Login (Recommended)**

```bash
# Run all tests with auto-login
./run-newman-tests.sh --html

# Run specific folder
./run-newman-tests.sh --folder "Moderation" --html

# Run with custom credentials
./run-newman-tests.sh \
  --email "admin@example.com" \
  --password "yourpassword" \
  --html
```

**Option B: Manual Token**

```bash
# Get token first
TOKEN=$(curl -X POST http://localhost/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Run tests with token
./run-newman-tests.sh --token "$TOKEN" --html
```

**Option C: Direct Newman**

```bash
# Update environment file with your token
newman run postman-collection.json \
  -e postman-environment.json \
  --env-var "adminToken=your-jwt-token" \
  -r htmlextra \
  --reporter-htmlextra-export ./newman-reports/report.html
```

### Test Options

```bash
# Run all tests
./run-newman-tests.sh

# Run with HTML report
./run-newman-tests.sh --html

# Run with JSON report
./run-newman-tests.sh --json

# Run specific folder
./run-newman-tests.sh --folder "Moderation"
./run-newman-tests.sh --folder "Book Validation"
./run-newman-tests.sh --folder "User Management"

# Run with delay (avoid rate limiting)
./run-newman-tests.sh --delay 1000

# Run with verbose output
./run-newman-tests.sh --verbose

# Run against different environment
./run-newman-tests.sh \
  --url "https://api.production.com/api/admin" \
  --user-service "https://api.production.com/api/users" \
  --email "admin@production.com" \
  --password "prod-password"
```

---

## Creating an Admin User

If you don't have an admin user yet:

### Option 1: Using Database

```bash
# Connect to PostgreSQL
docker exec -it shelfspace-postgres psql -U shelfspace -d shelfspace

# Create admin user (adjust the query based on your User model)
INSERT INTO "User" (id, email, password, role, username, "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'admin@example.com',
  '$2b$10$hashed_password_here',  -- Use bcrypt to hash password
  'ADMIN',
  'admin',
  NOW(),
  NOW()
);
```

### Option 2: Using User Service API

```bash
# Register a user
curl -X POST http://localhost/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "username": "admin"
  }'

# Then manually update role in database to ADMIN
```

### Option 3: Using Seed Script (if available)

```bash
cd services/user-service
npm run seed  # if seed script exists
```

---

## Troubleshooting

### Service Won't Start

**Problem**: Admin service fails to start

**Solutions**:

```bash
# Check if database is running
docker-compose ps postgres

# Check database connection
docker exec -it shelfspace-postgres psql -U shelfspace -d shelfspace -c "SELECT 1;"

# Check admin service logs
docker-compose logs admin-service

# Restart service
docker-compose restart admin-service

# Rebuild if needed
docker-compose up -d --build admin-service
```

### Database Connection Error

**Problem**: `Error: P1001: Can't reach database server`

**Solutions**:

```bash
# Verify DATABASE_URL is correct
docker-compose exec admin-service env | grep DATABASE_URL

# Check if postgres is healthy
docker-compose ps postgres

# Run migrations
docker-compose exec admin-service npx prisma migrate deploy
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3007`

**Solutions**:

```bash
# Find process using port 3007
lsof -i :3007

# Kill the process
kill -9 <PID>

# Or use different port
# Edit .env: PORT=3008
```

### Newman Tests Fail - No Token

**Problem**: `401 Unauthorized` errors

**Solutions**:

```bash
# Verify user service is running
curl http://localhost/api/users/health

# Test login manually
curl -X POST http://localhost/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Check if user exists and has ADMIN role
docker exec -it shelfspace-postgres psql -U shelfspace -d shelfspace \
  -c "SELECT id, email, role FROM \"User\" WHERE email='admin@example.com';"

# Update .env.newman with correct credentials
```

### Newman Tests Fail - Connection Refused

**Problem**: `ECONNREFUSED` errors

**Solutions**:

```bash
# Check if services are running
docker-compose ps

# Check nginx gateway
curl http://localhost/health

# Test direct service access
curl http://localhost:3007/health

# Check nginx logs
docker-compose logs nginx-gateway

# Verify service URLs in .env.newman
```

### Tests Pass But Data Not Persisted

**Problem**: Tests succeed but data doesn't appear in database

**Solutions**:

```bash
# Check database connection
docker-compose exec admin-service npx prisma studio

# Verify migrations are applied
docker-compose exec admin-service npx prisma migrate status

# Check service logs for errors
docker-compose logs -f admin-service
```

---

## Verification Checklist

Before running tests, verify:

- [ ] PostgreSQL is running and accessible
- [ ] Admin service is running (`docker-compose ps admin-service`)
- [ ] Health endpoint responds (`curl http://localhost:3007/health`)
- [ ] User service is running (for authentication)
- [ ] Admin user exists with correct credentials
- [ ] Newman is installed (`newman --version`)
- [ ] `.env.newman` has correct credentials

---

## Quick Reference

### Service URLs

- Admin Service (direct): `http://localhost:3007`
- Admin Service (via gateway): `http://localhost/api/admin`
- User Service (for login): `http://localhost/api/users`
- Health Check: `http://localhost:3007/health`

### Common Commands

```bash
# Start everything
docker-compose --profile dev up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f admin-service

# Restart service
docker-compose restart admin-service

# Run tests
./test-api.sh

# Run specific test folder
./run-newman-tests.sh --folder "Moderation" --html

# View test reports
open newman-reports/report_*.html
```

---

## Next Steps

1. ✅ Start the admin service
2. ✅ Create/verify admin user
3. ✅ Run health check
4. ✅ Run Newman tests
5. ✅ Check HTML report
6. 🎉 Start building!

For detailed API documentation, see: `admin-service-docs.md`
For Newman usage details, see: `NEWMAN_GUIDE.md`
