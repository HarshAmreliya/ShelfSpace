# Rate Limiting and Backpressure at the Edge

ShelfSpace uses NGINX request limiting as first-line backpressure.

## Why Edge Limiting

- protects all downstream services uniformly
- reduces abusive burst traffic
- preserves headroom for legitimate users

## Architecture Note

Edge limits should be complemented by service-level protections for expensive endpoints.
