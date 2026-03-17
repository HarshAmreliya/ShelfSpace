# Idempotency and Safe Retries in Distributed APIs

Retries are unavoidable in distributed systems. APIs should be designed so retries do not corrupt state.

## Where It Matters

- list/book move operations
- reaction upserts
- session refresh calls

## Practical Rules

- prefer upsert semantics for toggle-like writes
- use unique constraints on junction entities
- return deterministic results for duplicate requests
