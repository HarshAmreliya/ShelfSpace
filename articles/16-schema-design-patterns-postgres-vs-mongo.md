# Schema Design Patterns: PostgreSQL vs MongoDB

ShelfSpace uses both relational and document data stores based on domain fit.

## PostgreSQL Domains

User, library, review, forum, chat, and admin domains use relational schemas because they need strong constraints, relations, and transactional behavior.

## MongoDB Domains

Book catalog and analytics use document models for flexible payloads and aggregation-heavy reads.

## Pattern

Use the right storage model per domain need, but keep service contracts consistent regardless of backing store.
