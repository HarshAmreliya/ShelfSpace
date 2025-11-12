#!/bin/bash

# Quick start script - minimal deployment for rapid testing
# This script skips some checks and uses faster defaults

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🚀 Quick Starting ShelfSpace...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check for Docker
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Docker is required. Please install Docker first.${NC}"
  exit 1
fi

# Quick environment check
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your actual values${NC}"
  fi
fi

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker-compose --profile dev up -d

echo ""
echo -e "${GREEN}✓ Services starting...${NC}"
echo ""
echo -e "${BLUE}Access your application at:${NC}"
echo -e "  ${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "  ${GREEN}API:      http://localhost/api${NC}"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo -e "  ${YELLOW}docker-compose logs -f${NC}"
echo ""
echo -e "${BLUE}To stop services:${NC}"
echo -e "  ${YELLOW}./scripts/stop-local.sh${NC}"

