# Domain-Driven Service Design in ShelfSpace

ShelfSpace maps major product capabilities to dedicated services. This is a pragmatic form of domain-driven design.

## Domain Mapping

- Identity and preferences -> `user-service`
- Personal collections -> `user-library-service`
- Catalog search and metadata -> `book-service`
- Community discussions -> `forum-service`
- Real-time conversation -> `chat-service`
- Moderation workflows -> `admin-service`
- Behavioral reporting -> `analytics-service`

## Why It Works

Each service can evolve language, data model, and release cycle around its domain. Cross-domain coordination happens through API contracts and events rather than direct table sharing.

## Key Rule

Keep service boundaries aligned with business capability, not technical layers.
