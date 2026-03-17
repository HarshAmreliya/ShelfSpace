# Query Optimization Architecture for Forums

Forum workloads are read-heavy and hierarchical.

## Optimization Priorities

- paginate threads/posts with stable ordering
- index membership lookup paths
- avoid deep nested payloads in list views

## Result

Lower latency for browse flows and predictable load on relational storage.
