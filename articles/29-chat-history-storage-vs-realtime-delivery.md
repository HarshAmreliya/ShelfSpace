# Chat History Storage vs Realtime Delivery

Realtime transport and durable history are different concerns.

## Separation

- Socket.IO handles low-latency fanout.
- Database persistence is source of truth for history and replay.

## Architectural Benefit

Users get instant updates without sacrificing recoverable history after reconnects.
