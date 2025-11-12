# Testing Guide

This document outlines the testing strategy and setup for ShelfSpace microservices.

## Test Framework

We use **Jest** as the testing framework for all Node.js/TypeScript services.

### Setup

Each service has its own Jest configuration and test suite:

```bash
cd services/<service-name>
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

## Test Structure

```
services/
  <service-name>/
    src/
      __tests__/
        routes/
          *.routes.test.ts    # Route/API endpoint tests
        schemas.test.ts       # Validation schema tests
        utils/
          *.test.ts          # Utility function tests
```

## Test Types

### 1. Unit Tests

Test individual functions, utilities, and schemas in isolation.

**Example**: `services/user-service/src/__tests__/schemas.test.ts`

```typescript
import { createUserSchema } from "../schemas.js";

describe("createUserSchema", () => {
  it("should validate valid user data", () => {
    const validData = {
      email: "test@example.com",
      name: "Test User",
    };
    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

### 2. Integration Tests

Test API endpoints with mock dependencies.

**Example**: `services/user-service/src/__tests__/routes/user.routes.test.ts`

```typescript
import request from "supertest";
import express from "express";

describe("User Routes", () => {
  it("should require authentication", async () => {
    const response = await request(app)
      .get("/api/users/me");
    expect(response.status).toBe(401);
  });
});
```

### 3. End-to-End Tests (Planned)

Test complete workflows across services using test containers.

## Running Tests

### Single Service

```bash
cd services/user-service
npm test
```

### All Services

```bash
# From project root
find services -name "package.json" -execdir npm test \;
```

## Test Coverage Goals

Current coverage targets:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

These are minimum thresholds. Aim for higher coverage on critical paths.

## Test Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Naming**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **Mock External Dependencies**: Use mocks for database, HTTP calls, etc.
5. **Test Edge Cases**: Include tests for error conditions and boundary cases

## Service-Specific Notes

### User Service

Tests cover:
- User creation and authentication
- Schema validation
- Preference management
- Authentication middleware

### Review Service

Tests cover:
- Review creation, update, deletion
- Authorization (only owner can edit/delete)
- Schema validation

### Book Service

Tests cover:
- Book CRUD operations
- Search and pagination
- Schema validation

### Group Service

Tests cover:
- Group creation and membership
- Authorization checks
- Schema validation

### Chat Service

Tests cover:
- Socket.IO connection handling
- Message validation
- Group membership verification

### User Library Service

Tests cover:
- Reading list CRUD operations
- Book addition/removal
- Move books between lists
- Default list initialization

## Mocking Strategy

### Database (Prisma)

Mock Prisma client:

```typescript
jest.mock("../prisma.ts", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
```

### External Services (Axios)

Mock HTTP calls:

```typescript
jest.mock("axios");
import axios from "axios";
(axios.get as jest.Mock).mockResolvedValue({ data: mockData });
```

### Cache (Redis)

Mock Redis cache:

```typescript
jest.mock("../utils/cache.ts", () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));
```

## CI Integration

Tests should run automatically in CI:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    cd services/user-service
    npm test -- --coverage
```

## Future Enhancements

1. **Test Containers**: Use Docker test containers for integration tests
2. **E2E Tests**: Add end-to-end tests with Playwright or Cypress
3. **Load Tests**: Use k6 or Artillery for performance testing
4. **Contract Testing**: Add Pact for service contract testing

## Troubleshooting

### Tests fail with module resolution errors

Ensure `jest.config.js` has correct `moduleNameMapper` for ESM:

```javascript
moduleNameMapper: {
  '^(\\.{1,2}/.*)\\.js$': '$1',
},
```

### TypeScript errors in tests

Ensure `ts-jest` is configured correctly with ESM support.

### Database connection errors

Tests should use mocked Prisma client, not real database connections.

