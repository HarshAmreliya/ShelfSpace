# Library Domain Architecture: Reading Lists and Book Associations

The library domain is centered on `ReadingList` and `ReadingListBook`.

## Data Model

- A user owns many reading lists.
- A reading list contains many book references.
- Junction rows preserve ordering and timestamps.

## Service Behaviors

- CRUD reading lists
- add/remove books
- move books between lists
- create default lists

## Cross-Service Calls

Library service validates book references against book service and may enrich payloads with book details.

## Consistency Strategy

The library service owns list state. Book metadata is external and referenced by `bookId`.

This allows:

- independent list operations
- stable ownership boundaries
- simpler evolution of catalog vs personal library concerns
