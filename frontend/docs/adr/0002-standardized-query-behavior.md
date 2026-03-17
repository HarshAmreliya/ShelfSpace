# ADR 0002: Standardized Query Behavior

## Status
Accepted

## Context
Multiple data hooks implemented near-identical logic for cache, stale checks, retries, focus refetch, and optimistic mutation.

## Decision
Introduce shared query primitive: `src/hooks/data/useDataQuery.ts` and migrate core data hooks to it.

## Scope
Standardized behavior now applies to:
- `useBook`
- `useBooks`
- `useReadingLists`

## Consequences
- Consistent query behavior and lower maintenance overhead.
- Fewer subtle differences in retry/refetch/caching behavior between hooks.
- Easier extension to remaining hooks.
