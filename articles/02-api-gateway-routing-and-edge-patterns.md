# API Gateway Routing and Edge Patterns

ShelfSpace uses NGINX as the edge and routing layer. This centralizes client entry, enforces rate controls, and hides internal service topology.

## Routing Responsibilities

The gateway maps path prefixes to target services, for example:

- `/api/users/*` -> `user-service`
- `/api/library/*` -> `user-library-service` (with rewrite)
- `/api/books/*` -> `book-service`
- `/api/forums/*` -> `forum-service`
- `/api/chat/*` and `/socket.io/*` -> `chat-service`
- `/api/admin/*` -> `admin-service`
- `/api/analytics/*` -> `analytics-service`
- `/api/chatbot/*` -> `chatbot-service`

## Edge Controls

- Per-IP request limiting (`limit_req`) reduces burst abuse.
- WebSocket upgrade handling is centralized for Socket.IO.
- X-Forwarded headers preserve client/source context.

## Architectural Tradeoffs

### Benefits
- Single external endpoint for clients.
- Easy policy enforcement at the edge.
- Simplifies frontend API configuration.

### Risks
- Gateway misconfiguration can affect all services.
- Path rewrites must remain synchronized with backend routes.

The gateway is a control plane, not business logic. Keeping it lean is key.
