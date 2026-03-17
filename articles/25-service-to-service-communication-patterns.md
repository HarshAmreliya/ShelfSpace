# Service-to-Service Communication Patterns in ShelfSpace

ShelfSpace uses synchronous HTTP calls for cross-service checks and enrichment, plus asynchronous-style analytics event emission.

## Patterns in Use

- **Auth verification call** to user-service
- **Lookup/enrichment calls** to book-service and forum-service
- **Telemetry/event emission** to analytics-service

## Design Principle

Use synchronous calls for critical authorization and correctness checks. Keep telemetry non-blocking when possible.
