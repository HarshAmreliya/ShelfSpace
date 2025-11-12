# ShelfSpace Local Deployment Guide

This guide explains how to deploy ShelfSpace locally for testing and development.

## Prerequisites

Before deploying, ensure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v20 or higher)
- **npm** (v9 or higher)

### Verify Installation

```bash
docker --version
docker-compose --version  # or: docker compose version
node --version  # Should be v20+
npm --version
```

## Quick Start

For the fastest deployment (minimal checks, good for testing):

```bash
./scripts/quick-start.sh
```

This will:
- Copy `.env.example` to `.env` if needed
- Start all services with Docker Compose
- Display access URLs

## Full Deployment

For a complete deployment with all checks and migrations:

```bash
./scripts/deploy-local.sh
```

### Deployment Script Options

```bash
# Clean rebuild (removes volumes and rebuilds images)
./scripts/deploy-local.sh --clean

# Skip database migrations
./scripts/deploy-local.sh --skip-migrations

# Skip Docker build (use existing images)
./scripts/deploy-local.sh --skip-build

# Only start services (skip prerequisites check)
./scripts/deploy-local.sh --services-only

# Combine options
./scripts/deploy-local.sh --clean --skip-migrations
```

## What the Deployment Script Does

### 1. Prerequisites Check
- Verifies Docker, Docker Compose, Node.js, and npm are installed
- Checks that required ports are available
- Validates Node.js version (requires v20+)

### 2. Environment Setup
- Creates `.env` file from `.env.example` if missing
- Creates `frontend/.env.local` from `frontend/.env.example` if missing
- Warns about missing critical environment variables

### 3. Docker Setup
- Builds Docker images for all services
- Creates Docker network
- Starts database services (PostgreSQL, MongoDB, Redis)
- Waits for databases to be healthy

### 4. Database Migrations
- Generates Prisma clients for all services
- Runs database migrations for:
  - user-service
  - review-service
  - user-library-service
  - group-service
  - chat-service
  - admin-service

### 5. Service Startup
- Starts all backend services
- Starts frontend service
- Starts NGINX API Gateway
- Waits for services to be healthy

### 6. Health Checks
- Verifies all services are responding
- Displays service status

## Environment Variables

### Required Variables

Before running the deployment, ensure these are set in `.env`:

```env
# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=your_secure_jwt_secret_here

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Optional Variables

See `.env.example` for all available configuration options.

## Accessing the Application

After deployment, access the application at:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost/api
- **Health Check**: http://localhost/health

### Service Endpoints

All services are accessible through the API Gateway at `/api/*`:

- User Service: `/api/users/*`
- Book Service: `/api/books/*`
- Review Service: `/api/reviews/*`
- Group Service: `/api/groups/*`
- Library Service: `/api/library/*`
- Chat Service: `/api/chat/*`
- Admin Service: `/api/admin/*`
- Chatbot Service: `/api/chatbot/*`

### Direct Service Access (for debugging)

- User Service: http://localhost:3001
- Review Service: http://localhost:3002
- Library Service: http://localhost:3003
- Book Service: http://localhost:3004
- Group Service: http://localhost:3005
- Chat Service: http://localhost:3006
- Admin Service: http://localhost:3007
- Chatbot Service: http://localhost:8000

### Database Access

- **PostgreSQL**: `localhost:5432`
  - Default database: `shelfspace`
  - Default user: `shelfspace`
  - Default password: `shelfspace_dev_pass` (change in production!)

- **MongoDB**: `localhost:27017`
  - Default database: `books`
  - Default user: `shelfspace`
  - Default password: `shelfspace_dev_pass` (change in production!)

- **Redis**: `localhost:6379`
  - No authentication required in development

## Managing Services

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f frontend
docker-compose logs -f nginx-gateway
```

### Stop Services

```bash
# Stop services (preserves data)
./scripts/stop-local.sh

# Stop services and remove volumes (deletes all data)
./scripts/stop-local.sh --clean
```

Or manually:
```bash
docker-compose down        # Stop services
docker-compose down -v     # Stop services and remove volumes
```

### Restart a Service

```bash
docker-compose restart user-service
docker-compose restart frontend
```

### Rebuild a Service

```bash
docker-compose build user-service
docker-compose up -d user-service
```

## Troubleshooting

### Services Won't Start

1. **Check logs**:
   ```bash
   docker-compose logs service-name
   ```

2. **Check port conflicts**:
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :5432
   ```

3. **Verify environment variables**:
   ```bash
   cat .env
   cat frontend/.env.local
   ```

### Database Connection Issues

1. **Verify databases are running**:
   ```bash
   docker-compose ps
   docker-compose logs postgres
   docker-compose logs mongodb
   ```

2. **Check database health**:
   ```bash
   docker exec shelfspace-postgres pg_isready
   docker exec shelfspace-mongodb mongosh --eval "db.adminCommand('ping')"
   docker exec shelfspace-redis redis-cli ping
   ```

3. **Reset databases** (WARNING: Deletes all data):
   ```bash
   docker-compose down -v
   ./scripts/deploy-local.sh --clean
   ```

### Migration Issues

If migrations fail:

1. **Run migrations manually**:
   ```bash
   cd services/user-service
   npm install
   npm run db:generate
   npx prisma migrate deploy
   ```

2. **Reset migrations** (WARNING: Deletes all data):
   ```bash
   cd services/user-service
   npx prisma migrate reset
   ```

### Frontend Not Loading

1. **Check frontend logs**:
   ```bash
   docker-compose logs frontend
   ```

2. **Verify environment variables**:
   ```bash
   cat frontend/.env.local
   ```

3. **Rebuild frontend**:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### NGINX Gateway Issues

1. **Check gateway logs**:
   ```bash
   docker-compose logs nginx-gateway
   ```

2. **Test gateway health**:
   ```bash
   curl http://localhost/health
   ```

3. **Verify gateway config**:
   ```bash
   docker exec shelfspace-nginx nginx -t
   ```

## Development Mode

For active development with hot reload:

The `docker-compose.dev.yml` file is automatically used when you run:

```bash
docker-compose --profile dev up
```

This mounts source code as volumes for hot reloading.

## Production Deployment

For production deployment:

1. Update environment variables with production values
2. Use production Docker Compose profile:
   ```bash
   docker-compose --profile prod up -d
   ```
3. Configure SSL/TLS certificates (see `docker-compose.prod.yml`)
4. Set up proper secrets management
5. Configure backups for databases
6. Set up monitoring and logging

## Additional Resources

- **API Documentation**: See `docs/api/README.md`
- **Service Documentation**: See `services/*/.*-service-docs.md`
- **Integration Plan**: See `INTEGRATION_PLAN_VERIFICATION.md`
- **Prisma Migrations**: See `PRISMA_MIGRATIONS.md`

## Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Review the service-specific documentation
3. Check the integration verification report
4. Ensure all prerequisites are installed correctly

## Scripts Reference

- `./scripts/deploy-local.sh` - Full deployment script
- `./scripts/quick-start.sh` - Quick start script
- `./scripts/stop-local.sh` - Stop services script
- `./scripts/ci-check.sh` - CI checks script

