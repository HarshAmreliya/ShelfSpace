#!/bin/bash

# User Service - Newman Test Runner
# This script runs the Postman collection using Newman with various options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BASE_URL="http://localhost:3001"
GATEWAY_URL="http://localhost/api/users"
TEST_EMAIL="test-$(date +%s)@example.com"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
FOLDER=""
DELAY=0
VERBOSE=""
REPORTERS="cli"
HTML_REPORT=false
JSON_REPORT=false

# Function to print colored output
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

# Function to show usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Run Newman tests for User Service API

OPTIONS:
    -h, --help              Show this help message
    -u, --url URL           Base URL for the service (default: http://localhost:3001)
    -g, --gateway URL       Gateway URL (default: http://localhost/api/users)
    -e, --email EMAIL       Test user email (default: auto-generated)
    -a, --admin EMAIL       Admin email for admin tests
    -f, --folder NAME       Run specific folder only
    -d, --delay MS          Delay between requests in milliseconds
    -v, --verbose           Verbose output
    --html                  Generate HTML report
    --json                  Generate JSON report
    --reporters LIST        Custom reporters (comma-separated)

EXAMPLES:
    # Run all tests
    $0

    # Run with HTML report
    $0 --html

    # Run specific folder
    $0 --folder "User Profile"

    # Run against different environment
    $0 --url "http://localhost:3001" --email "test@example.com"

    # Run with delay and verbose output
    $0 --delay 1000 --verbose --html

EOF
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -g|--gateway)
            GATEWAY_URL="$2"
            shift 2
            ;;
        -e|--email)
            TEST_EMAIL="$2"
            shift 2
            ;;
        -a|--admin)
            ADMIN_EMAIL="$2"
            shift 2
            ;;
        -f|--folder)
            FOLDER="$2"
            shift 2
            ;;
        -d|--delay)
            DELAY="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE="--verbose"
            shift
            ;;
        --html)
            HTML_REPORT=true
            shift
            ;;
        --json)
            JSON_REPORT=true
            shift
            ;;
        --reporters)
            REPORTERS="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    print_error "Newman is not installed"
    print_info "Install it with: npm install -g newman newman-reporter-htmlextra"
    exit 1
fi

# Check if collection file exists
if [ ! -f "postman-collection.json" ]; then
    print_error "postman-collection.json not found"
    print_info "Make sure you're in the services/user-service directory"
    exit 1
fi

# Check if environment file exists
if [ ! -f "postman-environment.json" ]; then
    print_error "postman-environment.json not found"
    exit 1
fi

# Setup reporters
if [ "$HTML_REPORT" = true ]; then
    REPORTERS="cli,htmlextra"
    mkdir -p newman-reports
    HTML_REPORT_PATH="newman-reports/report_$(date +%Y%m%d_%H%M%S).html"
fi

if [ "$JSON_REPORT" = true ]; then
    if [ "$REPORTERS" = "cli" ]; then
        REPORTERS="cli,json"
    else
        REPORTERS="$REPORTERS,json"
    fi
    mkdir -p newman-reports
    JSON_REPORT_PATH="newman-reports/report_$(date +%Y%m%d_%H%M%S).json"
fi

# Print configuration
echo ""
print_info "User Service Newman Test Runner"
echo "=================================="
print_info "Base URL: $BASE_URL"
print_info "Gateway URL: $GATEWAY_URL"
print_info "Test Email: $TEST_EMAIL"
[ -n "$ADMIN_EMAIL" ] && print_info "Admin Email: $ADMIN_EMAIL"
[ -n "$FOLDER" ] && print_info "Folder: $FOLDER"
[ "$DELAY" -gt 0 ] && print_info "Delay: ${DELAY}ms"
print_info "Reporters: $REPORTERS"
echo ""

# Build Newman command
NEWMAN_CMD="newman run postman-collection.json"
NEWMAN_CMD="$NEWMAN_CMD -e postman-environment.json"
NEWMAN_CMD="$NEWMAN_CMD --env-var baseUrl=$BASE_URL"
NEWMAN_CMD="$NEWMAN_CMD --env-var gatewayUrl=$GATEWAY_URL"
NEWMAN_CMD="$NEWMAN_CMD --env-var testEmail=$TEST_EMAIL"
[ -n "$ADMIN_EMAIL" ] && NEWMAN_CMD="$NEWMAN_CMD --env-var adminEmail=$ADMIN_EMAIL"
[ -n "$FOLDER" ] && NEWMAN_CMD="$NEWMAN_CMD --folder \"$FOLDER\""
[ "$DELAY" -gt 0 ] && NEWMAN_CMD="$NEWMAN_CMD --delay-request $DELAY"
[ -n "$VERBOSE" ] && NEWMAN_CMD="$NEWMAN_CMD $VERBOSE"
NEWMAN_CMD="$NEWMAN_CMD -r $REPORTERS"
[ "$HTML_REPORT" = true ] && NEWMAN_CMD="$NEWMAN_CMD --reporter-htmlextra-export $HTML_REPORT_PATH"
[ "$JSON_REPORT" = true ] && NEWMAN_CMD="$NEWMAN_CMD --reporter-json-export $JSON_REPORT_PATH"

# Run Newman
print_info "Running tests..."
echo ""

if eval $NEWMAN_CMD; then
    echo ""
    print_success "All tests passed!"
    
    if [ "$HTML_REPORT" = true ]; then
        print_success "HTML report generated: $HTML_REPORT_PATH"
        
        # Try to open the report
        if command -v xdg-open &> /dev/null; then
            xdg-open "$HTML_REPORT_PATH" 2>/dev/null &
        elif command -v open &> /dev/null; then
            open "$HTML_REPORT_PATH" 2>/dev/null &
        fi
    fi
    
    if [ "$JSON_REPORT" = true ]; then
        print_success "JSON report generated: $JSON_REPORT_PATH"
    fi
    
    exit 0
else
    echo ""
    print_error "Some tests failed"
    
    if [ "$HTML_REPORT" = true ]; then
        print_info "Check HTML report for details: $HTML_REPORT_PATH"
    fi
    
    exit 1
fi
