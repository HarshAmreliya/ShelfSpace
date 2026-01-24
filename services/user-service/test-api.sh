#!/bin/bash

# User Service - Complete API Test Script
# This script sets up everything needed and runs Newman tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  $1"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_step() {
    echo -e "${CYAN}→${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    print_info "Please run this script from the services/user-service directory"
    exit 1
fi

print_header "User Service API Test Suite"

# Step 1: Check if Newman is installed
print_step "Checking Newman installation..."
if ! command -v newman &> /dev/null; then
    print_warning "Newman is not installed"
    print_info "Installing Newman and HTML reporter..."
    npm install -g newman newman-reporter-htmlextra
    print_success "Newman installed successfully"
else
    print_success "Newman is already installed"
fi

# Step 2: Check if service is running
print_step "Checking if User Service is running..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "User Service is running"
else
    print_error "User Service is not running"
    print_info "Please start the service first:"
    echo "  - Using Docker: docker-compose up -d user-service"
    echo "  - Locally: npm run dev"
    exit 1
fi

# Step 3: Check if required files exist
print_step "Checking test files..."
if [ ! -f "postman-collection.json" ]; then
    print_error "postman-collection.json not found"
    exit 1
fi
print_success "Postman collection found"

if [ ! -f "postman-environment.json" ]; then
    print_error "postman-environment.json not found"
    exit 1
fi
print_success "Postman environment found"

# Step 4: Create reports directory
print_step "Setting up reports directory..."
mkdir -p newman-reports
print_success "Reports directory ready"

# Step 5: Run the tests
print_header "Running API Tests"

# Generate unique test email
TEST_EMAIL="test-$(date +%s)@example.com"
print_info "Test email: $TEST_EMAIL"

# Run Newman with HTML report
print_step "Executing test collection..."
echo ""

REPORT_FILE="newman-reports/report_$(date +%Y%m%d_%H%M%S).html"

if newman run postman-collection.json \
    -e postman-environment.json \
    --env-var baseUrl=http://localhost:3001 \
    --env-var testEmail="$TEST_EMAIL" \
    -r cli,htmlextra \
    --reporter-htmlextra-export "$REPORT_FILE" \
    --reporter-htmlextra-title "User Service API Test Report" \
    --reporter-htmlextra-showOnlyFails false \
    --color on; then
    
    echo ""
    print_header "Test Results"
    print_success "All tests passed successfully!"
    print_success "HTML report generated: $REPORT_FILE"
    
    # Try to open the report
    print_step "Opening HTML report..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "$REPORT_FILE" 2>/dev/null &
        print_success "Report opened in browser"
    elif command -v open &> /dev/null; then
        open "$REPORT_FILE" 2>/dev/null &
        print_success "Report opened in browser"
    else
        print_info "Please open the report manually: $REPORT_FILE"
    fi
    
    echo ""
    print_header "Summary"
    echo "✓ Service health check passed"
    echo "✓ User registration and login tested"
    echo "✓ Authentication flow verified"
    echo "✓ User profile operations tested"
    echo "✓ Preferences management tested"
    echo "✓ Statistics endpoints tested"
    echo "✓ Admin operations tested"
    echo "✓ Error handling validated"
    echo ""
    print_success "User Service API is working correctly!"
    echo ""
    
    exit 0
else
    echo ""
    print_header "Test Results"
    print_error "Some tests failed"
    print_info "Check the HTML report for details: $REPORT_FILE"
    
    # Try to open the report
    if command -v xdg-open &> /dev/null; then
        xdg-open "$REPORT_FILE" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "$REPORT_FILE" 2>/dev/null &
    fi
    
    echo ""
    exit 1
fi
