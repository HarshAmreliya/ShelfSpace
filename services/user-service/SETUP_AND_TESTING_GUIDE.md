# User Service - Complete Setup and Testing Guide

This guide covers everything you need to run and test the User Service locally.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Redis Setup](#redis-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Service](#running-the-service)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** v18+ and npm
- **PostgreSQL** 14+
- **Redis** 6+
- **Docker** (optional, for containerized setup)

### Install Dependencies
```bash
cd services/user-service
npm install
```

---

## Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Start PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql
   ```

3. **Create Database and User**:
   ```bash
   # Connect as postgres superuser
   psql -U postgres
   
   # Run these commands in psql:
   CREATE USER shelfspace WITH PASSWORD 'shelfspace';
   CREATE DATABASE shelfspace_user_service OWNER shelfspace;
   ALTER USER shelfspace CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE shelfspace_user_service TO shelfspace;
   \q
   ```

4. **Run Migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

### Option 2: Docker PostgreSQL

```bash
docker run -d \
  --name postgres-user-service \
  -e POSTGRES_USER=shelfspace \
  -e POSTGRES_PASSWORD=shelfspace \
  -e POSTGRES_DB=shelfspace_user_service \
  -p 5432:5432 \
  postgres:14
```

---

## Redis Setup

### Option 1: Local Redis

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   ```

2. **Start Redis**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start redis
   
   # macOS
   brew services start redis
   ```

3. **Verify Redis is Running**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Option 2: Docker Redis

```bash
docker run -d \
  --name redis-user-service \
  -p 6379:6379 \
  redis:6-alpine
```

---

## Environment Configuration

### 1. Create .env File

Copy the example and configure:
```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your settings:

```env
# Database
DATABASE_URL="postgresql://shelfspace:shelfspace@localhost:5432/shelfspace_user_service"

# Redis
REDIS_URL="redis://localhost:6379"

# Service URLs
LIBRARY_SERVICE_URL="http://localhost:3003"

# Security
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
ADMIN_EMAILS="admin@example.com,test@example.com"

# Server
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost"
```

### Important Notes:
- **JWT_SECRET**: Use a strong, random string (min 32 characters)
- **ADMIN_EMAILS**: Comma-separated list of admin user emails
- **DATABASE_URL**: Update if using different credentials
- **REDIS_URL**: Update if Redis is on a different host/port

---

## Running the Service

### Development Mode (with hot reload)

```bash
npm run dev
```

The service will start on `http://localhost:3001`

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Verify Service is Running

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","service":"user-service"}
```

---

## Testing

### 1. Manual API Testing

#### Create a User
```bash
curl -X POST http://localhost:3001/api/me \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

Save the `token` and `user.id` from the response.

#### Get Token by User ID
```bash
USER_ID="<user-id-from-above>"
curl http://localhost:3001/api/token/$USER_ID
```

#### Get Current User Profile
```bash
TOKEN="<token-from-above>"
curl http://localhost:3001/api/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Update User Profile
```bash
curl -X PATCH http://localhost:3001/api/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "bio": "My bio"
  }'
```

### 2. Automated Testing with Newman

#### Install Newman
```bash
npm install -g newman newman-reporter-htmlextra
```

#### Run All Tests
```bash
./run-newman-tests.sh --html
```

#### Run Specific Test Folder
```bash
newman run postman-collection.json \
  -e postman-environment.json \
  --folder "User Profile"
```

#### View Test Results
After running tests with `--html`, open the generated report:
```bash
# The report will be in newman-reports/
open newman-reports/report_*.html
```

### 3. Unit Tests (Jest)

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## API Routes Reference

### Public Routes (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/me` | Create/login user |
| GET | `/api/token/:userId` | Get token by user ID (dev only) |

### Protected Routes (Require Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get current user profile |
| PATCH | `/api/me` | Update user profile |
| GET | `/api/me/preferences` | Get user preferences |
| PUT | `/api/me/preferences` | Update user preferences |
| GET | `/api/me/stats` | Get user statistics |
| POST | `/api/auth/verify` | Verify JWT token |

### Admin Routes (Require Admin Email)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/:userId/status` | Update user status |
| PUT | `/api/users/:userId/preferences/reset` | Reset user preferences |

---

## Troubleshooting

### Database Connection Issues

**Error**: `P3014: Prisma Migrate could not create the shadow database`

**Solution**: Grant CREATEDB permission:
```bash
psql -U postgres -c "ALTER USER shelfspace CREATEDB;"
```

**Error**: `permission denied for schema public`

**Solution**: Grant schema permissions:
```bash
psql -U postgres -d shelfspace_user_service -c "GRANT ALL ON SCHEMA public TO shelfspace;"
```

### Redis Connection Issues

**Error**: `Redis Client Error: connect ECONNREFUSED`

**Solution**: Ensure Redis is running:
```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
sudo systemctl start redis  # Linux
brew services start redis   # macOS
```

### Admin Endpoint Returns 500

**Error**: `Server configuration error`

**Solution**: Ensure `ADMIN_EMAILS` is set in `.env`:
```env
ADMIN_EMAILS="admin@example.com,test@example.com"
```

Then restart the service.

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**: Kill the process using port 3001:
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use a different port
PORT=3002 npm run dev
```

### Newman Tests Failing

**Issue**: Tests fail with 401 Unauthorized

**Solution**: 
1. Ensure service is running: `curl http://localhost:3001/health`
2. Check `.env` has correct `JWT_SECRET`
3. Verify `ADMIN_EMAILS` includes test emails
4. Restart the service to reload environment variables

**Issue**: Admin tests fail with 403 Forbidden

**Solution**: Ensure the test email is in `ADMIN_EMAILS`:
```env
ADMIN_EMAILS="admin@example.com,test@example.com"
```

---

## Development Tips

### Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Debugging

Enable verbose logging by setting in `.env`:
```env
NODE_ENV=development
```

View logs in real-time:
```bash
npm run dev | bunyan  # If you have bunyan installed
```

### Code Quality

```bash
# Type checking
npm run build

# Linting (if configured)
npm run lint
```

---

## Quick Reference Commands

```bash
# Setup
npm install
npm run db:generate
npm run db:migrate

# Run
npm run dev

# Test
npm test
./run-newman-tests.sh --html

# Database
npm run db:studio
npm run db:migrate

# Clean up
docker stop postgres-user-service redis-user-service
docker rm postgres-user-service redis-user-service
```

---

## Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Newman Documentation**: https://learning.postman.com/docs/running-collections/using-newman-cli/
- **Redis Documentation**: https://redis.io/documentation
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review service logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all dependencies (PostgreSQL, Redis) are running

---

**Last Updated**: November 2025
