# Authentication and Authorization Flow Across Services

ShelfSpace uses token-based identity and service-level verification.

## Request Path

1. Frontend sends bearer token.
2. Request passes through gateway to target service.
3. Target service verifies token (directly or via user-service auth route/middleware).
4. Service applies authorization checks (ownership, role, membership).
5. Domain logic executes only if auth checks pass.

## Authorization Shapes in the Codebase

- **Ownership checks**: user can modify only own lists/sessions/reviews.
- **Role checks**: admin-only actions in admin routes.
- **Membership checks**: chat/forum actions require forum membership.

## Practical Benefit

Auth logic is close to domain logic, so security decisions are contextual and explicit.

## Important Design Note

Authentication should fail closed:

- Invalid token -> `401`
- Valid token but forbidden action -> `403`

This avoids ambiguous failures and hardens API behavior.
