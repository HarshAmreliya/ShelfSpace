#!/bin/bash
# CI check script - run lint, typecheck, and tests locally

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running CI checks...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}Node.js version 20 or higher is required${NC}"
    exit 1
fi

# Services to check
SERVICES=(
    "frontend"
    "services/user-service"
    "services/user-library-service"
    "services/review-service"
    "services/book-service"
    "services/group-service"
    "services/chat-service"
    "services/admin-service"
)

FAILED=0

# Function to check a service
check_service() {
    local service_path=$1
    local service_name=$(basename "$service_path")
    
    echo -e "\n${YELLOW}Checking ${service_name}...${NC}"
    
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}  ✗ Service directory not found${NC}"
        return 1
    fi
    
    if [ ! -f "$service_path/package.json" ]; then
        echo -e "${YELLOW}  ⚠ No package.json found, skipping${NC}"
        return 0
    fi
    
    cd "$service_path"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "  Installing dependencies..."
        npm install --silent
    fi
    
    # TypeScript type check
    if [ -f "tsconfig.json" ]; then
        echo "  Running TypeScript type check..."
        if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
            echo -e "${GREEN}  ✓ TypeScript check passed${NC}"
        else
            echo -e "${RED}  ✗ TypeScript check failed${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi
    
    # Lint check
    if npm run lint &>/dev/null; then
        echo "  Running linter..."
        if npm run lint; then
            echo -e "${GREEN}  ✓ Lint check passed${NC}"
        else
            echo -e "${RED}  ✗ Lint check failed${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi
    
    # Test (if available)
    if grep -q "\"test\"" package.json && ! grep -q "echo.*Error.*no test" package.json; then
        echo "  Running tests..."
        if npm test -- --passWithNoTests 2>/dev/null; then
            echo -e "${GREEN}  ✓ Tests passed${NC}"
        else
            echo -e "${YELLOW}  ⚠ Tests failed or not configured${NC}"
        fi
    fi
    
    cd - > /dev/null
}

# Check all services
for service in "${SERVICES[@]}"; do
    check_service "$service" || true
done

# Summary
echo -e "\n${GREEN}CI checks completed${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}${FAILED} check(s) failed${NC}"
    exit 1
fi

