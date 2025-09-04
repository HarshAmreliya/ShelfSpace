# Chat Service API Documentation

This document outlines the API endpoints for the `chat-service`.

**Base URL**: `http://localhost/api/chat`

## Authentication

All endpoints require authentication. You need to provide a valid JWT in the `Authorization` header of your requests.

`Authorization: Bearer <YOUR_JWT>`

The `/api/chat` prefix is handled by the NGINX gateway, which then forwards the request to the `chat-service`.

## Chat Routes

These routes are for managing chat messages.

### GET /groups/:groupId/messages

Retrieves the message history for a specific group.

- **Method**: `GET`
- **Endpoint**: `/api/chat/groups/:groupId/messages`
- **Authentication**: Required
- **Description**: Fetches a paginated list of messages for a given group ID. The user must be a member of the group.
- **URL Parameters**:
  - `groupId` (string, required): The ID of the group.
- **Query Parameters**:
  - `limit` (number, optional, default: 100): The number of messages to return.
  - `offset` (number, optional, default: 0): The number of messages to skip.
- **Response**:
  - `200 OK`: An array of message objects.
  - `403 Forbidden`: If the user is not a member of the group.

## WebSockets

In addition to the REST API, the chat service also uses WebSockets for real-time communication. The WebSocket server is responsible for broadcasting new messages to group members.

To connect to the WebSocket server, you will need to establish a WebSocket connection to the appropriate endpoint (e.g., `ws://localhost/socket.io/`) and handle the various events for sending and receiving messages.
