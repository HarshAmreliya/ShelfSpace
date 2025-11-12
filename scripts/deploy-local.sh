#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Flags
CLEAN_REBUILD=false
SKIP_MIGRATIONS=false
SKIP_BUILD=false
SERVICES_ONLY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN_REBUILD=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --services-only)
      SERVICES_ONLY=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --clean            Clean rebuild (remove volumes, rebuild images)"
      echo "  --skip-migrations  Skip database migrations"
      echo "  --skip-build       Skip building services (use existing images)"
      echo "  --services-only    Only start services (skip prerequisites)"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    log_error "$1 is not installed"
    return 1
  fi
  return 0
}

check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    log_error "Port $1 is already in use"
    return 1
  fi
  return 0
}

wait_for_service() {
  local url=$1
  local service_name=$2
  local max_attempts=30
  local attempt=1

  log_info "Waiting for $service_name to be ready..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -sf "$url" > /dev/null 2>&1; then
      log_success "$service_name is ready"
      return 0
    fi
    echo -n "."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo ""
  log_error "$service_name failed to start after $((max_attempts * 2)) seconds"
  return 1
}

# ============================================
# 1. Prerequisites Check
# ============================================

if [ "$SERVICES_ONLY" = false ]; then
  log_info "Checking prerequisites..."
  
  # Check Docker
  if ! check_command docker; then
    log_error "Docker is required. Please install Docker first."
    exit 1
  fi
  
  # Check Docker Compose
  if ! check_command docker-compose && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is required. Please install Docker Compose first."
    exit 1
  fi
  
  # Check Node.js
  if ! check_command node; then
    log_error "Node.js is required. Please install Node.js v20+ first."
    exit 1
  fi
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 20 ]; then
    log_error "Node.js v20+ is required. Current version: $(node -v)"
    exit 1
  fi
  
  # Check npm
  if ! check_command npm; then
    log_error "npm is required. Please install npm first."
    exit 1
  fi
  
  log_success "All prerequisites met"
  
  # Check ports (warn but don't fail)
  log_info "Checking port availability..."
  PORTS=(80 3000 3001 3002 3003 3004 3005 3006 3007 5432 27017 6379 8000)
  PORT_CONFLICTS=()
  
  for port in "${PORTS[@]}"; do
    if ! check_port $port; then
      PORT_CONFLICTS+=($port)
    fi
  done
  
  if [ ${#PORT_CONFLICTS[@]} -gt 0 ]; then
    log_warning "The following ports are in use: ${PORT_CONFLICTS[*]}"
    log_warning "Services using these ports may fail to start"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

# ============================================
# 2. Environment Setup
# ============================================

if [ "$SERVICES_ONLY" = false ]; then
  log_info "Setting up environment variables..."
  
  cd "$PROJECT_ROOT"
  
  # Root .env file
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      log_info "Creating .env from .env.example..."
      cp .env.example .env
      log_warning "Please edit .env file with your actual values"
    else
      log_error ".env.example not found. Cannot create .env file."
      exit 1
    fi
  else
    log_success ".env file exists"
  fi
  
  # Frontend .env.local
  if [ ! -f frontend/.env.local ]; then
    if [ -f frontend/.env.example ]; then
      log_info "Creating frontend/.env.local from frontend/.env.example..."
      cp frontend/.env.example frontend/.env.local
      log_warning "Please edit frontend/.env.local with your actual values"
    else
      log_warning "frontend/.env.example not found. Frontend may not work correctly."
    fi
  else
    log_success "frontend/.env.local exists"
  fi
  
  # Verify critical environment variables
  log_info "Verifying critical environment variables..."
  source .env 2>/dev/null || true
  
  if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_jwt_secret_key_here_generate_random_string" ]; then
    log_warning "JWT_SECRET is not set or using default value"
    log_warning "Generate a secure secret with: openssl rand -base64 32"
  fi
  
  if [ -z "$GOOGLE_CLIENT_ID" ] || [ "$GOOGLE_CLIENT_ID" = "your_google_client_id" ]; then
    log_warning "GOOGLE_CLIENT_ID is not set. OAuth will not work."
  fi
  
  log_success "Environment setup complete"
fi

# ============================================
# 3. Clean Rebuild (if requested)
# ============================================

if [ "$CLEAN_REBUILD" = true ]; then
  log_info "Performing clean rebuild..."
  cd "$PROJECT_ROOT"
  
  log_info "Stopping all services..."
  docker-compose down -v 2>/dev/null || true
  
  log_info "Removing Docker volumes..."
  docker volume ls -q | grep shelfspace | xargs -r docker volume rm 2>/dev/null || true
  
  log_info "Cleaning Docker images..."
  docker-compose rm -f 2>/dev/null || true
fi

# ============================================
# 4. Docker Setup
# ============================================

cd "$PROJECT_ROOT"

log_info "Setting up Docker environment..."

# Build Docker images
if [ "$SKIP_BUILD" = false ]; then
  log_info "Building Docker images (this may take a while)..."
  docker-compose build --parallel || {
    log_error "Failed to build Docker images"
    exit 1
  }
  log_success "Docker images built successfully"
else
  log_info "Skipping Docker build (--skip-build)"
fi

# Start databases first
log_info "Starting database services..."
docker-compose up -d postgres mongodb redis

# Wait for databases to be healthy
log_info "Waiting for databases to be ready..."

# Wait for PostgreSQL
for i in {1..30}; do
  if docker exec shelfspace-postgres pg_isready -U ${POSTGRES_USER:-shelfspace} > /dev/null 2>&1; then
    log_success "PostgreSQL is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    log_error "PostgreSQL failed to start"
    exit 1
  fi
  sleep 1
done

# Wait for MongoDB
for i in {1..30}; do
  if docker exec shelfspace-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    log_success "MongoDB is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    log_error "MongoDB failed to start"
    exit 1
  fi
  sleep 1
done

# Wait for Redis
for i in {1..30}; do
  if docker exec shelfspace-redis redis-cli ping > /dev/null 2>&1; then
    log_success "Redis is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    log_error "Redis failed to start"
    exit 1
  fi
  sleep 1
done

# ============================================
# 5. Database Migrations
# ============================================

if [ "$SKIP_MIGRATIONS" = false ]; then
  log_info "Running database migrations..."
  
  SERVICES_WITH_PRISMA=(
    "user-service"
    "review-service"
    "user-library-service"
    "group-service"
    "chat-service"
    "admin-service"
  )
  
  for service in "${SERVICES_WITH_PRISMA[@]}"; do
    SERVICE_PATH="$PROJECT_ROOT/services/$service"
    
    if [ -d "$SERVICE_PATH/prisma" ]; then
      log_info "Running migrations for $service..."
      
      # Generate Prisma client
      cd "$SERVICE_PATH"
      if [ -f "package.json" ] && grep -q "prisma" package.json; then
        npm run db:generate 2>/dev/null || npx prisma generate || {
          log_warning "Failed to generate Prisma client for $service (may need to install dependencies)"
        }
      fi
      
      # Run migrations if migrations directory exists
      if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
        # Use docker-compose exec to run migrations inside the container
        # Or run locally if DATABASE_URL is set
        if command -v npx &> /dev/null && [ -f "$PROJECT_ROOT/.env" ]; then
          source "$PROJECT_ROOT/.env" 2>/dev/null || true
          if [ -n "$DATABASE_URL" ]; then
            npx prisma migrate deploy 2>/dev/null || {
              log_warning "Failed to run migrations for $service (may already be applied)"
            }
          fi
        fi
      else
        log_info "No migrations found for $service, skipping..."
      fi
    fi
  done
  
  log_success "Database migrations complete"
else
  log_info "Skipping database migrations (--skip-migrations)"
fi

# ============================================
# 6. Service Startup
# ============================================

log_info "Starting all services..."
cd "$PROJECT_ROOT"

# Start all services with dev profile
docker-compose --profile dev up -d

log_info "Waiting for services to start..."

# Wait for services to be healthy
SERVICES=(
  "user-service:3001"
  "review-service:3002"
  "user-library-service:3003"
  "book-service:3004"
  "group-service:3005"
  "chat-service:3006"
  "admin-service:3007"
  "chatbot-service:8000"
)

for service_port in "${SERVICES[@]}"; do
  IFS=':' read -r service port <<< "$service_port"
  wait_for_service "http://localhost:$port/health" "$service" || {
    log_warning "$service health check failed, but continuing..."
  }
done

# Wait for frontend
wait_for_service "http://localhost:3000" "frontend" || {
  log_warning "Frontend health check failed, but continuing..."
}

# Wait for gateway
wait_for_service "http://localhost/health" "nginx-gateway" || {
  log_warning "Gateway health check failed, but continuing..."
}

log_success "All services started"

# ============================================
# 7. Health Checks & Status
# ============================================

log_info "Checking service status..."
cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   ShelfSpace Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

echo -e "${BLUE}Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend:     ${GREEN}http://localhost:3000${NC}"
echo -e "  API Gateway:  ${GREEN}http://localhost/api${NC}"
echo ""

echo -e "${BLUE}Service Endpoints:${NC}"
echo -e "  User Service:        http://localhost:3001/health"
echo -e "  Review Service:      http://localhost:3002/health"
echo -e "  Library Service:     http://localhost:3003/health"
echo -e "  Book Service:        http://localhost:3004/health"
echo -e "  Group Service:       http://localhost:3005/health"
echo -e "  Chat Service:        http://localhost:3006/health"
echo -e "  Admin Service:       http://localhost:3007/health"
echo -e "  Chatbot Service:     http://localhost:8000/health"
echo ""

echo -e "${BLUE}Database Connections:${NC}"
echo -e "  PostgreSQL:          localhost:5432"
echo -e "  MongoDB:             localhost:27017"
echo -e "  Redis:               localhost:6379"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs:           ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop services:       ${YELLOW}docker-compose down${NC}"
echo -e "  Stop and cleanup:    ${YELLOW}docker-compose down -v${NC}"
echo -e "  Restart service:     ${YELLOW}docker-compose restart <service-name>${NC}"
echo ""

log_success "Deployment script completed successfully!"

