# Observability Architecture: Logs, Metrics, and Traces

Architecture quality depends on runtime visibility.

## Logging

Every service should emit structured logs with request ID, route, status code, and latency.

## Metrics

Track:

- request rate
- error rate
- p95/p99 latency
- dependency failure counts

## Tracing

Propagate trace IDs from gateway through downstream service calls.

## Outcome

You can localize failures quickly and reason about end-to-end path health.
