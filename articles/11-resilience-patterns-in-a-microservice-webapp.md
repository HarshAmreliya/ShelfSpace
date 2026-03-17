# Resilience Patterns in a Microservice Web App

ShelfSpace uses practical resilience choices rather than heavy infrastructure complexity.

## Patterns Visible in the Codebase

- Gateway-level rate limiting.
- Service-level health endpoints.
- Typed validation at route boundaries.
- Best-effort analytics emission (domain call should not always fail if analytics is down).
- Cache-assisted flows with DB fallback paths.

## Failure Semantics

- Auth/membership failures are hard stops.
- Non-critical telemetry failures are soft warnings.
- Data store failures return explicit server errors.

## Design Principle

Not all dependencies are equal. Treating critical and non-critical dependencies differently improves user-perceived reliability.
