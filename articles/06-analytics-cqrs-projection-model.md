# Analytics as a CQRS-Style Projection Model

ShelfSpace analytics is built like a lightweight CQRS pipeline.

## Write Side

Domain services emit events to `POST /api/analytics/events`.

Examples:

- `BOOK_ADDED`
- `THREAD_CREATED`
- `CHAT_MESSAGE_SENT`
- `ADMIN_USER_STATUS_UPDATED`

Events are inserted into an events collection.

## Projection Side

`projector.ts` transforms events into per-user aggregate documents.

Projected dimensions include:

- totals (books, pages, minutes)
- monthly trends
- genre distribution
- ratings histogram
- activity timeline
- goals snapshot

## Read Side

Dashboard endpoints read from projection documents:

- `/dashboard/summary`
- `/dashboard/reading-analytics`
- `/dashboard/reading-goals`
- `/dashboard/activity`

## Architectural Value

- Fast dashboard reads.
- Simple event ingestion contract.
- Decouples operational writes from analytical queries.
