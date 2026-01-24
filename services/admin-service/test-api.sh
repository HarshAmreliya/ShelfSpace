#!/bin/bash

# Quick Test Script for Admin Service
# Just run: ./test-api.sh

set -e

echo "🚀 Admin Service API Test Runner"
echo "================================="
echo ""

# Make the main script executable
chmod +x run-newman-tests.sh

# Check if .env.newman exists
if [ ! -f ".env.newman" ]; then
    echo "⚙️  Creating .env.newman configuration file..."
    cat > .env.newman << 'EOF'
# Newman Test Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
USER_SERVICE_URL=http://localhost/api/users
ADMIN_SERVICE_URL=http://localhost/api/admin
EOF
    echo "✅ Created .env.newman - please update with your credentials"
    echo ""
fi

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo "📦 Newman not found. Installing..."
    npm install -g newman newman-reporter-htmlextra
    echo "✅ Newman installed"
    echo ""
fi

# Run tests with HTML report
echo "🧪 Running API tests with auto-login..."
echo ""

./run-newman-tests.sh --html --verbose

echo ""
echo "✨ Done! Check ./newman-reports for detailed HTML report"
