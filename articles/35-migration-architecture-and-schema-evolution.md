# Migration Architecture and Schema Evolution

Schema evolution is continuous in microservices.

## Safe Migration Approach

1. add compatible columns/fields
2. backfill data
3. switch readers/writers
4. remove deprecated fields later

## Principle

Prefer expand-and-contract migrations over risky breaking changes.
