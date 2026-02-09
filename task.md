# Backend Architecture Improvement Tasks

1. Align architecture docs and diagrams with actual service topology
- Update `mermaid/architecture.mmd` to include all backend services (user, review, library, book, forum, chat, admin, analytics, chatbot) and correct data stores.
- Update `mermaid/deployment_diagram.mmd` to reflect actual ports, services, and data stores from `docker-compose.yml`.
- Add a short “Architecture Overview” section to a top-level doc (e.g. `docs/api/README.md` if it exists, or create `docs/architecture.md`).

2. Enforce true DB-per-service isolation
- Decide DB-per-service strategy (separate Postgres DBs vs schemas).
- Update `docker-compose.yml` to set a unique `DATABASE_URL` per service (no shared DB name).
- Update each service’s Prisma config/migrations to target its own DB.
- Document the new DB mapping in `docs/architecture.md`.

3. Introduce async analytics/event ingestion
- Choose a broker (Redis Streams as a minimal step, or NATS/Rabbit/Kafka for durability).
- Implement an outbox or reliable event publishing in services producing analytics events.
- Implement analytics consumer in `analytics-service` to process events.
- Remove direct synchronous HTTP calls to analytics or make them best-effort fallback only.

4. Add resilience patterns to inter-service HTTP
- Create a shared HTTP client wrapper with timeouts, retry with jitter, and circuit breaker support.
- Replace direct Axios calls in services with the shared client.
- Add per-service configuration for retry/circuit breaker thresholds.

5. Add service-to-service authentication
- Decide on mTLS or signed service tokens (JWT or HMAC).
- Implement verification at each service boundary.
- Ensure internal service calls include service identity headers.

6. Add distributed tracing and centralized logging
- Add OpenTelemetry instrumentation to all Node services and the Python chatbot service.
- Add correlation/request ID propagation from gateway through all services.
- Stand up metrics/logging stack (Prometheus + Loki + Tempo or equivalent) and wire exporters.

7. Strengthen API gateway policies
- Add JWT validation and authorization checks at the gateway (or via an auth sidecar).
- Enforce per-route request size limits.
- Add schema validation or contract validation at ingress.
- Expand rate limits beyond the current basic per-IP limits.

8. Standardize caching patterns and Redis usage
- Define cache usage guidelines (TTL, invalidation rules, allowed data types).
- Implement a shared cache utility library.
- Update services to follow consistent cache strategy.

9. Normalize routing conventions
- Remove confusing proxy rewrites (e.g. `/api/user-chat/` rewriting to `/api/chat/`).
- Ensure route prefixes map cleanly to the owning service.
- Update frontend and clients to use the new canonical routes.

10. Establish contract-first API governance
- Add OpenAPI specs per service.
- Add contract tests to CI.
- Introduce versioning policy and deprecation process.
