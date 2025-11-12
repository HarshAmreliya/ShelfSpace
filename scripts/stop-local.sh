#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse command line arguments
CLEAN_VOLUMES=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --clean|--volumes)
      CLEAN_VOLUMES=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --clean, --volumes  Remove Docker volumes (WARNING: Deletes all data)"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}Stopping ShelfSpace services...${NC}"

if [ "$CLEAN_VOLUMES" = true ]; then
  echo -e "${YELLOW}WARNING: This will remove all Docker volumes and delete all data!${NC}"
  read -p "Are you sure? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo -e "${GREEN}Services stopped and volumes removed${NC}"
  else
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
  fi
else
  docker-compose down
  echo -e "${GREEN}Services stopped${NC}"
fi

echo ""
echo -e "${BLUE}To start services again, run:${NC}"
echo -e "  ${YELLOW}./scripts/deploy-local.sh${NC}"

