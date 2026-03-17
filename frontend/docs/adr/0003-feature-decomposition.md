# ADR 0003: Feature Decomposition (State vs Presentation)

## Status
Accepted

## Context
Large feature components mixed render markup with heavy controller logic, making maintenance and onboarding difficult.

## Decision
Extract controller/state logic into dedicated hooks while keeping components presentation-first.

## Applied
- `ChatFeatureWithSessions` now uses `useChatFeatureWithSessionsUI`.
- `ForumFeature` now uses `useForumFeatureState`.

## Consequences
- Better testability of interaction logic.
- Lower cognitive load in component files.
- Clearer extension points for future behavior changes.
