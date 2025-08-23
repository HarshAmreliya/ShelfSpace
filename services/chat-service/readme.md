# Chat Service

This service handles real-time group chat functionality using WebSockets.

## Endpoints & Events

### HTTP Endpoints

- `GET /api/chat/groups/:groupId/messages`: Retrieves the message history for a specific group.

### WebSocket Events

- **`join_group` (client to server):** Subscribes the client to a specific group's chat room.
- **`chat_message` (client to server):** Receives a new message from a client, verifies group membership, saves it to the database, and broadcasts it to the group.
- **`chat_message` (server to client):** Sends a new message to all clients in a group's room.
- **`error` (server to client):** Sends an error message to a client.

## Analysis & Issues

1.  **Refactoring:** The service was successfully refactored from the `ws` library to `socket.io`, providing more robust features like rooms and broadcasting.
2.  **Security:** Authentication and group membership verification have been implemented. Users must be authenticated to connect, and can only send messages to groups they are a member of.
3.  **CORS Configuration:** The `socket.io` server is currently configured with a CORS origin of `"*"`, which is acceptable for development but is insecure for production. It should be restricted to the frontend's actual domain.

## Suggestions

1.  **Restrict CORS Origin:** In a production environment, the `cors.origin` in `src/socket.ts` should be updated to a specific whitelist of allowed domains.
2.  **Enhance Error Handling:** While basic error handling is in place, it could be made more granular. For example, providing different error messages for different failure scenarios (e.g., database error vs. validation error) would improve client-side feedback.
3.  **Add User Presence:** Implement functionality to track which users are currently online and in which group chat. This could be done by emitting `user_joined` and `user_left` events to the group.

## Running the Service

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Set up the database:

    ```bash
    npx prisma migrate dev
    ```

3.  Start the service:

    ```bash
    npm run dev
    ```

## API Endpoints (REST)

All REST endpoints are prefixed with `/api/chat`.

### Message History

#### `GET /groups/:groupId/messages`

Retrieves the message history for a specific group.

**Authentication:** Required (Bearer Token)

**Authorization:** User must be a member of the specified group.

**Path Parameters:**

-   `groupId` (string): The ID of the chat group.

**Query Parameters:**

-   `limit` (optional, number): Maximum number of messages to retrieve (default: 100).
-   `offset` (optional, number): Number of messages to skip (default: 0).

**Response:**

-   **200 OK:** An array of message objects.

    ```json
    [
      {
        "id": "clx...",
        "senderId": "clx...",
        "groupId": "clx...",
        "content": "Hello everyone!",
        "timestamp": "2025-08-23T10:00:00.000Z"
      },
      // ... more messages
    ]
    ```

-   **401 Unauthorized:** If no valid token is provided.
-   **403 Forbidden:** If the user is not a member of the group.
-   **500 Internal Server Error:** For unexpected errors.

## WebSocket Events

The chat service uses Socket.io for real-time communication. The Socket.io server is initialized on the same HTTP server as the Express app.

### Connection and Authentication

Clients must provide a JWT token in the `auth` object during the handshake.

**Handshake Example (Client-side):**

```javascript
const socket = io("http://localhost:3006", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

**Server-side Authentication Flow:**

-   The server verifies the provided token with the `user-service`.
-   If valid, the `userId` is attached to the socket object.
-   If invalid, the connection is rejected with an authentication error.

### Events

#### `join_group` (Client -> Server)

Clients emit this event to join a specific chat group.

**Payload:** `(string) groupId` - The ID of the group to join.

#### `chat_message` (Client -> Server)

Clients emit this event to send a new message to a group.

**Payload:**

```json
{
  "groupId": "string",
  "content": "string"
}
```

**Server-side Processing:**

-   Verifies that the sender is a member of the `groupId` using the `group-service`.
-   Saves the message to the database.
-   Broadcasts the message to all clients in the specified `groupId` room.

#### `chat_message` (Server -> Client)

Servers emit this event to broadcast new messages to clients in a group.

**Payload:**

```json
{
  "id": "string",
  "senderId": "string",
  "groupId": "string",
  "content": "string",
  "timestamp": "ISO 8601 string"
}
```

#### `error` (Server -> Client)

Servers emit this event to notify clients of errors (e.g., invalid message format, unauthorized access).

**Payload:**

```json
{
  "message": "string"
}
```

#### `disconnect` (Client/Server)

Emitted when a client disconnects from the server.