# Admin Architecture: Moderation, Validation, and Control Plane Flows

The admin service acts as an operational control plane for moderation actions.

## Core Entities

- `ModerationLog`
- `BookValidation`

## Action Patterns

- Write local moderation records.
- Trigger cross-service admin operations (e.g., user status and preferences reset via user-service).
- Emit analytics events for auditability and reporting.

## Architectural Role

Admin service should orchestrate governance actions without becoming a data owner for all domains.

## Why This Matters

- Domain services keep ownership.
- Admin workflows stay explicit and traceable.
- Compliance and operational visibility improve through structured logs.
