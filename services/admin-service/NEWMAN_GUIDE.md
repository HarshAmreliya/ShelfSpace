# Newman Testing Guide for Admin Service

This guide provides comprehensive instructions for testing the Admin Service API using Newman (Postman CLI).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [Advanced Usage](#advanced-usage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Admin Service running (locally or remotely)
- Valid admin JWT token

## Installation

Install Newman globally:

```bash
npm install -g newman
```

Or install Newman with HTML reporter for better test reports:

```bash
npm install -g newman newman-reporter-htmlextra
```

## Quick Start

### 1. Get an Admin Token

First, you need to authenticate and get an admin JWT token. You can do this by:

**Option A: Using the user-service login endpoint**

```bash
curl -X POST http://localhost/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-admin-password"
  }'
```

**Option B: Create a test admin user** (if you have database access)

```bash
# Connect to your database and create an admin user
# Then use the login endpoint above
```

### 2. Update Environment Variables

Edit `postman-environment.json` and add your admin token:

```json
{
  "key": "adminToken",
  "value": "your-actual-jwt-token-here",
  "type": "secret",
  "enabled": true
}
```

### 3. Run All Tests

```bash
newman run postman-collection.json \
  -e postman-environment.json
```

## Environment Setup

### Local Development

For local testing, use the default environment:

```bash
# Default: http://localhost/api/admin
newman run postman-collection.json -e postman-environment.json
```

### Production/Staging Environment

Create a custom environment file for different environments:

```bash
# Create production environment
cat > postman-environment-prod.json << 'EOF'
{
  "id": "admin-service-prod",
  "name": "Admin Service Production",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://your-production-domain.com/api/admin",
      "type": "default",
      "enabled": true
    },
    {
      "key": "adminToken",
      "value": "your-production-admin-token",
      "type": "secret",
      "enabled": true
    }
  ]
}
EOF

# Run tests against production
newman run postman-collection.json -e postman-environment-prod.json
```

## Running Tests

### Run All Tests

```bash
newman run postman-collection.json -e postman-environment.json
```

### Run Specific Folder

```bash
# Run only moderation tests
newman run postman-collection.json \
  -e postman-environment.json \
  --folder "Moderation"

# Run only book validation tests
newman run postman-collection.json \
  -e postman-environment.json \
  --folder "Book Validation"

# Run only user management tests
newman run postman-collection.json \
  -e postman-environment.json \
  --folder "User Management"
```

### Run with Detailed Output

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  --verbose
```

### Generate HTML Report

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  -r htmlextra \
  --reporter-htmlextra-export ./reports/admin-service-report.html
```

### Run with Custom Variables

Override environment variables from command line:

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  --env-var "baseUrl=http://localhost:3007/api/admin" \
  --env-var "adminToken=your-token-here"
```

## Advanced Usage

### Run Tests with Delay

Add delay between requests to avoid rate limiting:

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  --delay-request 1000  # 1 second delay
```

### Run Tests with Timeout

Set custom timeout for requests:

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  --timeout-request 10000  # 10 seconds
```

### Run Tests Multiple Times

Run the entire collection multiple times:

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  --iteration-count 3
```

### Export Results to JSON

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  -r json \
  --reporter-json-export ./reports/results.json
```

### Run Tests with Multiple Reporters

```bash
newman run postman-collection.json \
  -e postman-environment.json \
  -r cli,json,htmlextra \
  --reporter-json-export ./reports/results.json \
  --reporter-htmlextra-export ./reports/report.html
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/admin-service-tests.yml`:

```yaml
name: Admin Service API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  api-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Newman
        run: |
          npm install -g newman
          npm install -g newman-reporter-htmlextra

      - name: Start Services
        run: |
          docker-compose up -d
          sleep 30  # Wait for services to be ready

      - name: Get Admin Token
        id: auth
        run: |
          TOKEN=$(curl -X POST http://localhost/api/users/login \
            -H "Content-Type: application/json" \
            -d '{"email":"${{ secrets.ADMIN_EMAIL }}","password":"${{ secrets.ADMIN_PASSWORD }}"}' \
            | jq -r '.token')
          echo "::set-output name=token::$TOKEN"

      - name: Run Newman Tests
        run: |
          newman run services/admin-service/postman-collection.json \
            -e services/admin-service/postman-environment.json \
            --env-var "adminToken=${{ steps.auth.outputs.token }}" \
            -r htmlextra,cli \
            --reporter-htmlextra-export ./test-results/report.html

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
admin-service-tests:
  stage: test
  image: node:18
  services:
    - docker:dind
  before_script:
    - npm install -g newman newman-reporter-htmlextra
    - docker-compose up -d
    - sleep 30
  script:
    - |
      TOKEN=$(curl -X POST http://localhost/api/users/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
        | jq -r '.token')
    - |
      newman run services/admin-service/postman-collection.json \
        -e services/admin-service/postman-environment.json \
        --env-var "adminToken=$TOKEN" \
        -r htmlextra,cli \
        --reporter-htmlextra-export ./test-results/report.html
  artifacts:
    when: always
    paths:
      - test-results/
    expire_in: 1 week
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g newman newman-reporter-htmlextra'
            }
        }

        stage('Start Services') {
            steps {
                sh 'docker-compose up -d'
                sh 'sleep 30'
            }
        }

        stage('Get Admin Token') {
            steps {
                script {
                    def response = sh(
                        script: """
                            curl -X POST http://localhost/api/users/login \
                              -H "Content-Type: application/json" \
                              -d '{"email":"${ADMIN_EMAIL}","password":"${ADMIN_PASSWORD}"}'
                        """,
                        returnStdout: true
                    ).trim()
                    def json = readJSON text: response
                    env.ADMIN_TOKEN = json.token
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh """
                    newman run services/admin-service/postman-collection.json \
                      -e services/admin-service/postman-environment.json \
                      --env-var "adminToken=${ADMIN_TOKEN}" \
                      -r htmlextra,cli \
                      --reporter-htmlextra-export ./test-results/report.html
                """
            }
        }
    }

    post {
        always {
            publishHTML([
                reportDir: 'test-results',
                reportFiles: 'report.html',
                reportName: 'API Test Report'
            ])
        }
    }
}
```

## Troubleshooting

### Issue: "ECONNREFUSED" Error

**Problem**: Cannot connect to the service.

**Solution**:

```bash
# Check if service is running
docker-compose ps

# Check service logs
docker-compose logs admin-service

# Verify the correct URL
curl http://localhost/api/admin/../../health
```

### Issue: "401 Unauthorized" Error

**Problem**: Invalid or expired token.

**Solution**:

```bash
# Get a fresh token
curl -X POST http://localhost/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Update environment file with new token
```

### Issue: "404 Not Found" Error

**Problem**: Incorrect base URL or route.

**Solution**:

```bash
# Verify the service is accessible
curl http://localhost/api/admin/../../health

# Check nginx configuration
cat api-gateway/nginx.conf | grep admin
```

### Issue: Tests Fail Due to Missing Data

**Problem**: Database doesn't have required test data.

**Solution**:

```bash
# Run database migrations
cd services/admin-service
npx prisma migrate dev

# Seed test data if available
npm run seed  # if seed script exists
```

### Issue: Rate Limiting

**Problem**: Too many requests in a short time.

**Solution**:

```bash
# Add delay between requests
newman run postman-collection.json \
  -e postman-environment.json \
  --delay-request 2000  # 2 second delay
```

## Test Data Management

### Creating Test Data

Before running tests, ensure you have test data:

```bash
# Example: Create test book IDs
export TEST_BOOK_ID="clx123456789"

# Update environment
newman run postman-collection.json \
  -e postman-environment.json \
  --env-var "bookId=$TEST_BOOK_ID"
```

### Cleanup After Tests

```bash
# If you need to clean up test data
# Connect to database and run cleanup queries
# Or create a cleanup script
```

## Best Practices

1. **Use Environment Variables**: Never hardcode sensitive data in collection
2. **Run Health Check First**: Always verify service is running
3. **Use Folders**: Organize tests by feature for easier debugging
4. **Add Delays**: Use delays in CI/CD to avoid overwhelming the service
5. **Generate Reports**: Always generate HTML reports for better visibility
6. **Version Control**: Keep collection and environment files in version control
7. **Separate Environments**: Use different environment files for dev/staging/prod
8. **Monitor Logs**: Check service logs when tests fail

## Additional Resources

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Collection Format](https://schema.postman.com/)
- [Newman Reporters](https://www.npmjs.com/search?q=newman-reporter)

## Support

For issues or questions:

1. Check service logs: `docker-compose logs admin-service`
2. Verify database connection: Check DATABASE_URL in .env
3. Review API documentation: `services/admin-service/admin-service-docs.md`
