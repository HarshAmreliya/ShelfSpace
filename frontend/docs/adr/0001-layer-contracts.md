# ADR 0001: Frontend Layer Contracts

## Status
Accepted

## Context
The codebase uses multiple abstraction layers (`app/components`, `hooks`, `lib`, `services`). Without explicit contracts, responsibilities blur and logic spreads across layers.

## Decision
Adopt explicit layer contracts:
- `app` + `components`: presentation and interaction only.
- `hooks`: screen/feature orchestration and local state composition.
- `lib`: transport wrappers (HTTP clients, endpoint methods, DTOs, transport errors).
- `services`: domain workflows and data transformation across one or more `lib` modules.
- `utils`: pure helpers and diagnostics.

## Consequences
- Easier ownership and refactoring by layer.
- Lower coupling between UI and transport concerns.
- More predictable placement for new functionality.

## Enforcement
- Architecture docs reference these contracts.
- ESLint `no-restricted-imports` rules discourage direct `axios` usage outside wrappers.
