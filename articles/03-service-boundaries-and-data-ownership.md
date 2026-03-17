# Service Boundaries and Data Ownership in ShelfSpace

A strong microservice architecture depends on one rule: **each service owns its data and behavior**.

## Domain Ownership Map

- **User Service**: identity profile, preferences, stats, goals, badges, chat sessions
- **Library Service**: reading lists and list-book associations
- **Book Service**: book catalog and metadata (Mongo)
- **Review Service**: user reviews tied to book IDs
- **Forum Service**: forums, memberships, threads, posts, reactions
- **Chat Service**: message stream for group chat
- **Admin Service**: moderation logs and book validation
- **Analytics Service**: event log + projected dashboard read model

## Reference vs Ownership

Services often store foreign IDs (e.g., `userId`, `bookId`) without owning those entities. This is intentional and preserves autonomy.

## Integration Rule

Cross-service interactions should:

1. Verify identity/authorization through user service.
2. Keep remote calls minimal and purpose-specific.
3. Emit analytics as side effects, not core transaction dependencies.

This gives independence without losing product-level cohesion.
