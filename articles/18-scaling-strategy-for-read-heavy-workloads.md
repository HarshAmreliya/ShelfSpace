# Scaling Strategy for Read-Heavy Workloads

ShelfSpace has read-heavy surfaces: dashboard, catalog browse, and forum views.

## Scaling Levers

- Cache popular reads where safe.
- Keep payloads lean for list endpoints.
- Use dedicated read models (analytics already follows this).
- Add indexes matching query patterns.

## Service-Specific Notes

- Book service: optimize aggregation and projection paths.
- Analytics service: precomputed user aggregates.
- Forum service: paginate threads/posts with stable sort keys.
