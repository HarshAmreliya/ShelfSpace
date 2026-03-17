# Book Service Architecture: MongoDB Model and Query Pipeline

The book service is optimized for catalog browsing and search.

## Storage Choice

Book documents are stored in MongoDB, which fits flexible catalog-like metadata.

## Query Pipeline Design

The service applies aggregation pipelines for:

- filtering (author, genre, search)
- sorting
- pagination
- projection (omit large fields where needed)

## Security Consideration

Search inputs are sanitized before regex use, reducing injection/ReDoS risk.

## Why This Design Fits

- Document model matches variable book metadata.
- Aggregation supports efficient list endpoints.
- Service remains focused on catalog concerns, not user state.
