# Evolution Roadmap for ShelfSpace Architecture

ShelfSpace already has clear service boundaries. The next architectural gains come from standardization and observability.

## Near-Term Improvements

1. Standardize service-to-service client wrappers.
2. Enforce shared error envelope contracts.
3. Add distributed tracing IDs across gateway and services.
4. Add per-service SLO dashboards.

## Medium-Term Improvements

1. Move cross-service HTTP event emissions toward async transport where needed.
2. Introduce shared schema package for event contract typing.
3. Add read-through caching for frequently requested book metadata.

## Governance Improvements

- Keep ADRs updated for major architectural decisions.
- Define ownership docs per service.
- Automate architecture checks in CI (lint for layer violations, dependency drift checks).

A stable architecture is not static. It evolves through explicit, documented decisions.
