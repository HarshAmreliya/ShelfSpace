# Transactional Boundaries and Eventual Consistency

In ShelfSpace, each service owns its own transaction boundary. Cross-service operations are eventually consistent.

## Example

Adding a book to a reading list may involve:

1. Library service write (authoritative)
2. Book service lookup (validation/enrichment)
3. Analytics event emission

Only step 1 is core transaction state. Steps 2 and 3 can be retried or degraded.

## Design Benefit

The system stays responsive and avoids distributed transactions.

## Operational Requirement

Eventual consistency must be visible in API behavior and UX messaging.
