# CI/CD Pipeline Documentation

This document describes the CI/CD pipeline setup for ShelfSpace.

## GitHub Actions Workflows

### 1. Main CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint & TypeCheck**: Runs ESLint and TypeScript type checking across all services
- **Test**: Runs tests for services that have test suites configured
- **Build Images**: Builds Docker images for all services
- **Scan Images**: Scans Docker images for vulnerabilities using Trivy

### 2. Docker Build & Push (`.github/workflows/docker-build.yml`)

Runs on pushes to `main` branch and version tags.

**Features:**
- Builds and pushes Docker images to GitHub Container Registry
- Multi-platform builds (linux/amd64, linux/arm64)
- Automatic tagging based on branch, PR, version, and commit SHA
- Build caching for faster builds

### 3. Prisma Migrate Check (`.github/workflows/prisma-migrate-check.yml`)

Runs on pull requests that modify Prisma schemas or migrations.

**Features:**
- Validates Prisma migrations
- Ensures migrations can be applied successfully
- Checks migration status

### 4. Frontend CI (`.github/workflows/frontend-ci.yml`)

Runs on changes to frontend code.

**Features:**
- TypeScript type checking
- ESLint
- Jest tests with coverage
- Codecov integration

### 5. Backend CI (`.github/workflows/backend-ci.yml`)

Runs on changes to backend services.

**Features:**
- TypeScript type checking per service
- Prisma client generation
- Test execution for services with tests

## Local CI Checks

### Using the CI Check Script

Run the `scripts/ci-check.sh` script to perform all CI checks locally:

```bash
./scripts/ci-check.sh
```

The script will:
1. Check Node.js version (requires v20+)
2. Install dependencies if needed
3. Run TypeScript type checks
4. Run linters
5. Run tests (where available)

### Using Make

A `Makefile` provides convenient commands:

```bash
make lint       # Run linters
make typecheck  # Run TypeScript checks
make test       # Run tests
make build      # Build all services
make ci         # Run full CI checks
make docker-build  # Build Docker images
make docker-up     # Start services
make docker-down   # Stop services
```

## Service-Specific Checks

### Frontend
- **Lint**: `npm run lint` (Next.js ESLint)
- **TypeCheck**: `npx tsc --noEmit`
- **Test**: `npm test` (Jest)

### Backend Services

#### User Service
- **TypeCheck**: `npx tsc --noEmit`
- **Test**: `npm test` (Jest with Supertest)

#### Other Services
- **TypeCheck**: `npx tsc --noEmit`
- **Tests**: Currently minimal, should be expanded

## Docker Image Scanning

All Docker images are scanned for vulnerabilities using Trivy:
- Scans for CRITICAL and HIGH severity vulnerabilities
- Results uploaded to GitHub Security tab
- Fails build if critical vulnerabilities found (configurable)

## Prisma Migration Checks

When Prisma schema files or migrations are modified:
- Migrations are validated against a test database
- Ensures migrations can be applied and rolled back
- Checks for schema drift

## Caching

The CI pipeline uses GitHub Actions caching for:
- npm dependencies
- Docker build layers (via BuildKit cache)
- Prisma generated clients

## Continuous Deployment

Currently, the pipeline only builds and pushes images. Deployment to production should be configured separately based on your infrastructure.

## Troubleshooting

### Type Check Failures
- Ensure all dependencies are installed: `npm ci`
- Check TypeScript configuration in `tsconfig.json`
- Verify imports and type definitions

### Test Failures
- Ensure test database is properly configured
- Check environment variables in CI workflow
- Verify test scripts in `package.json`

### Docker Build Failures
- Check Dockerfile syntax
- Ensure all dependencies are correctly specified
- Verify build context paths

### Migration Check Failures
- Ensure migration files are properly formatted
- Check for schema conflicts
- Verify database connection in CI environment

## Best Practices

1. **Run checks locally before pushing**: Use `./scripts/ci-check.sh` or `make ci`
2. **Fix linting errors**: Address ESLint warnings before committing
3. **Write tests**: Add tests for new features and bug fixes
4. **Keep dependencies updated**: Regularly update npm packages and scan for vulnerabilities
5. **Document changes**: Update this document when adding new checks or workflows

