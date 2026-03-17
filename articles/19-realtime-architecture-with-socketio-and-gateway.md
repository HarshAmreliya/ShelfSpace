# Realtime Architecture with Socket.IO and Gateway Proxying

ShelfSpace routes Socket.IO traffic through NGINX to chat-service.

## Connection Path

Client -> `/socket.io/` -> NGINX upgrade -> chat-service socket layer

## Architectural Considerations

- Preserve sticky/session semantics if horizontally scaling sockets.
- Keep message persistence separated from transport events.
- Validate auth and membership before room subscription.

## Reliability Principle

Realtime delivery should be best-effort, while durable message history remains database-backed.
