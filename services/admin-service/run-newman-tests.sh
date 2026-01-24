#!/bin/bash

# Admin Service Newman Test Runner
# This script helps you run Newman tests with various options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT_FILE="postman-environment.json"
COLLECTION_FILE="postman-collection.json"
REPORT_DIR="./newman-reports"
ADMIN_TOKEN=""
BASE_URL="http://localhost/api/admin"
USER_SERVICE_URL="http://localhost/api/users"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
FOLDER=""
DELAY=0
VERBOSE=false
AUTO_LOGIN=true

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Run Newman tests for Admin Service API

OPTIONS:
    -h, --help              Show this help message
    -t, --token TOKEN       Admin JWT token (optional - will auto-login if not provided)
    --email EMAIL           Admin email for auto-login
    --password PASSWORD     Admin password for auto-login
    --user-service URL      User service URL (default: http://localhost/api/users)
    -e, --env FILE          Environment file (default: postman-environment.json)
    -c, --collection FILE   Collection file (default: postman-collection.json)
    -u, --url URL           Base URL (default: http://localhost/api/admin)
    -f, --folder FOLDER     Run specific folder only
    -d, --delay MS          Delay between requests in milliseconds
    -v, --verbose           Verbose output
    -r, --report-dir DIR    Report directory (default: ./newman-reports)
    --html                  Generate HTML report
    --json                  Generate JSON report
    --no-color              Disable colored output
    --no-auto-login         Disable automatic login

EXAMPLES:
    # Run all tests with auto-login (reads from .env)
    $0

    # Run with custom credentials
    $0 --email "admin@example.com" --password "password123"

    # Run all tests with token
    $0 --token "your-jwt-token"

    # Run only moderation tests with auto-login
    $0 --folder "Moderation" --html

    # Run against custom URL with credentials
    $0 --url "https://api.example.com/api/admin" --email "admin@example.com" --password "pass"

EOF
    exit 1
}

# Parse command line arguments
REPORTERS="cli"
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -t|--token)
            ADMIN_TOKEN="$2"
            AUTO_LOGIN=false
            shift 2
            ;;
        --email)
            ADMIN_EMAIL="$2"
            shift 2
            ;;
        --password)
            ADMIN_PASSWORD="$2"
            shift 2
            ;;
        --user-service)
            USER_SERVICE_URL="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT_FILE="$2"
            shift 2
            ;;
        -c|--collection)
            COLLECTION_FILE="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
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
            VERBOSE=true
            shift
            ;;
        -r|--report-dir)
            REPORT_DIR="$2"
            shift 2
            ;;
        --html)
            REPORTERS="$REPORTERS,htmlextra"
            shift
            ;;
        --json)
            REPORTERS="$REPORTERS,json"
            shift
            ;;
        --no-color)
            RED=''
            GREEN=''
            YELLOW=''
            BLUE=''
            NC=''
            shift
            ;;
        --no-auto-login)
            AUTO_LOGIN=false
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Function to load credentials from .env file
load_env_credentials() {
    local env_file=""
    
    # Try multiple locations for .env file (prioritize .env.newman)
    if [ -f ".env.newman" ]; then
        env_file=".env.newman"
    elif [ -f ".env" ]; then
        env_file=".env"
    elif [ -f "../.env" ]; then
        env_file="../.env"
    elif [ -f "../../.env" ]; then
        env_file="../../.env"
    else
        return 1
    fi
    
    print_info "Loading credentials from $env_file"
    
    # Load admin credentials from .env
    if [ -z "$ADMIN_EMAIL" ]; then
        ADMIN_EMAIL=$(grep -E "^ADMIN_EMAIL=" "$env_file" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    if [ -z "$ADMIN_PASSWORD" ]; then
        ADMIN_PASSWORD=$(grep -E "^ADMIN_PASSWORD=" "$env_file" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    if [ -z "$ADMIN_TOKEN" ]; then
        ADMIN_TOKEN=$(grep -E "^ADMIN_TOKEN=" "$env_file" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
    fi
    
    if [ -z "$USER_SERVICE_URL" ]; then
        local temp_url=$(grep -E "^USER_SERVICE_URL=" "$env_file" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
        if [ -n "$temp_url" ]; then
            USER_SERVICE_URL="$temp_url"
        fi
    fi
    
    return 0
}

# Function to auto-login and get JWT token
auto_login() {
    print_info "Attempting automatic login..."
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install curl or provide token manually."
        return 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. Attempting to parse JSON manually..."
        HAS_JQ=false
    else
        HAS_JQ=true
    fi
    
    # Prepare login request
    local login_url="${USER_SERVICE_URL}/login"
    local login_data="{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}"
    
    print_info "Logging in to: $login_url"
    
    # Make login request
    local response=$(curl -s -w "\n%{http_code}" -X POST "$login_url" \
        -H "Content-Type: application/json" \
        -d "$login_data")
    
    # Extract status code and body
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" != "200" ] && [ "$http_code" != "201" ]; then
        print_error "Login failed with status code: $http_code"
        print_error "Response: $body"
        return 1
    fi
    
    # Extract token from response
    if [ "$HAS_JQ" = true ]; then
        ADMIN_TOKEN=$(echo "$body" | jq -r '.token // .accessToken // .jwt // empty')
    else
        # Manual JSON parsing (basic)
        ADMIN_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        if [ -z "$ADMIN_TOKEN" ]; then
            ADMIN_TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        fi
        if [ -z "$ADMIN_TOKEN" ]; then
            ADMIN_TOKEN=$(echo "$body" | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
        fi
    fi
    
    if [ -z "$ADMIN_TOKEN" ]; then
        print_error "Failed to extract token from login response"
        print_error "Response: $body"
        return 1
    fi
    
    print_success "Successfully obtained JWT token"
    return 0
}

# Handle token acquisition
if [ -z "$ADMIN_TOKEN" ] && [ "$AUTO_LOGIN" = true ]; then
    # Try to load credentials from .env
    if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
        load_env_credentials
    fi
    
    # Check if we have credentials
    if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
        print_warning "No credentials found. Trying default admin credentials..."
        ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
        ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
    fi
    
    # Attempt auto-login
    if ! auto_login; then
        print_error "Auto-login failed. Please provide token manually with --token option"
        echo ""
        echo "Or provide credentials:"
        echo "  $0 --email admin@example.com --password yourpassword"
        exit 1
    fi
elif [ -z "$ADMIN_TOKEN" ]; then
    print_error "Admin token is required. Use --token option or enable auto-login."
    echo ""
    usage
fi

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    print_error "Newman is not installed. Please install it first:"
    echo "  npm install -g newman"
    exit 1
fi

# Check if htmlextra reporter is needed and installed
if [[ $REPORTERS == *"htmlextra"* ]]; then
    if ! npm list -g newman-reporter-htmlextra &> /dev/null; then
        print_warning "newman-reporter-htmlextra is not installed. Installing now..."
        npm install -g newman-reporter-htmlextra
    fi
fi

# Check if collection file exists
if [ ! -f "$COLLECTION_FILE" ]; then
    print_error "Collection file not found: $COLLECTION_FILE"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENVIRONMENT_FILE" ]; then
    print_error "Environment file not found: $ENVIRONMENT_FILE"
    exit 1
fi

# Create report directory
mkdir -p "$REPORT_DIR"

# Build Newman command
NEWMAN_CMD="newman run $COLLECTION_FILE"
NEWMAN_CMD="$NEWMAN_CMD -e $ENVIRONMENT_FILE"
NEWMAN_CMD="$NEWMAN_CMD --env-var \"adminToken=$ADMIN_TOKEN\""
NEWMAN_CMD="$NEWMAN_CMD --env-var \"baseUrl=$BASE_URL\""

if [ -n "$FOLDER" ]; then
    NEWMAN_CMD="$NEWMAN_CMD --folder \"$FOLDER\""
fi

if [ "$DELAY" -gt 0 ]; then
    NEWMAN_CMD="$NEWMAN_CMD --delay-request $DELAY"
fi

if [ "$VERBOSE" = true ]; then
    NEWMAN_CMD="$NEWMAN_CMD --verbose"
fi

NEWMAN_CMD="$NEWMAN_CMD -r $REPORTERS"

if [[ $REPORTERS == *"htmlextra"* ]]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    NEWMAN_CMD="$NEWMAN_CMD --reporter-htmlextra-export $REPORT_DIR/report_$TIMESTAMP.html"
fi

if [[ $REPORTERS == *"json"* ]]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    NEWMAN_CMD="$NEWMAN_CMD --reporter-json-export $REPORT_DIR/results_$TIMESTAMP.json"
fi

# Print configuration
print_info "Starting Newman tests..."
echo ""
print_info "Configuration:"
echo "  Collection: $COLLECTION_FILE"
echo "  Environment: $ENVIRONMENT_FILE"
echo "  Base URL: $BASE_URL"
echo "  Token: ${ADMIN_TOKEN:0:20}..." # Show only first 20 chars
[ -n "$FOLDER" ] && echo "  Folder: $FOLDER"
[ "$DELAY" -gt 0 ] && echo "  Delay: ${DELAY}ms"
echo "  Reporters: $REPORTERS"
echo "  Report Directory: $REPORT_DIR"
echo ""

# Run Newman
print_info "Executing tests..."
echo ""

if eval $NEWMAN_CMD; then
    echo ""
    print_success "All tests completed successfully!"
    
    if [[ $REPORTERS == *"htmlextra"* ]]; then
        print_info "HTML report generated in: $REPORT_DIR"
    fi
    
    exit 0
else
    echo ""
    print_error "Tests failed!"
    exit 1
fi
