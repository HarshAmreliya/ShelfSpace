# Security Architecture: Defense in Depth

ShelfSpace security is most effective when layered.

## Layers

1. Gateway rate limiting and edge constraints
2. Service authentication checks
3. Authorization by role/ownership/membership
4. Input validation on every route
5. Safe query construction and output filtering

## Architecture Rule

Security policy should not depend on frontend behavior. Every backend entry point must enforce it.
