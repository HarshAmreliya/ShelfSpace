# Technical Debt Map and Refactor Priorities

A microservice system needs visible debt management.

## Priority Areas

1. Error envelope standardization across services
2. Shared auth client utilities for service-to-service calls
3. Common retry/backoff policy for non-critical dependencies
4. Better test coverage on integration boundaries

## Refactor Approach

Target debt by risk and blast radius, not by code age.
