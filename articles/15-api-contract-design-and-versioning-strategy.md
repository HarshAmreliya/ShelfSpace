# API Contract Design and Versioning Strategy

Microservices stay healthy when contracts are explicit and stable.

## Current Contract Shape

ShelfSpace services expose route groups by domain (`/api/users`, `/api/books`, `/api/forums`, etc.) behind a common gateway.

## Recommended Versioning Approach

- Keep internal evolution backward compatible where possible.
- Introduce `/v2` only for breaking changes.
- Document payload field guarantees and deprecation windows.

## Guardrails

- Validate all request bodies with schema middleware.
- Normalize error responses.
- Add contract tests for critical endpoints.
