# Tests

This directory contains cross-service test assets.

## Contents

- `integration/`: Jest-based integration tests that exercise service communication.
- `*.sh`: curl smoke scripts for key services.

## Curl Smoke Scripts

Available scripts:

- `user-service-curl.sh`
- `book-service-curl.sh`
- `review-service-curl.sh`
- `forum-service-curl.sh`
- `user-library-service-curl.sh`

Run example:

```bash
bash tests/user-service-curl.sh
```

Most scripts assume services are available at default localhost ports from compose and that dependencies (user-service/book-service) are already running.

## Integration Tests

Configured by root `jest.config.cjs` to run:

- `tests/integration/**/*.test.ts`

Run from repository root:

```bash
npx jest -c jest.config.cjs
```

Optional environment overrides (see `tests/integration/setup.ts`):

- `TEST_USER_SERVICE_URL`
- `TEST_REVIEW_SERVICE_URL`
- `TEST_FORUM_SERVICE_URL`
- `TEST_LIBRARY_SERVICE_URL`
- `TEST_BOOK_SERVICE_URL`
- `TEST_CHAT_SERVICE_URL`
- `TEST_ADMIN_SERVICE_URL`
- `TEST_DATABASE_URL`

## Notes

- Some integration tests appear to use legacy route patterns (for example `/reviews` without `/api/reviews`), so they may require updates to match current service routes.
- Curl scripts are currently the most accurate executable contract for endpoint behavior in this repository state.

