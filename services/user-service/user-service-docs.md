# User Service API Documentation

This document outlines the API endpoints for the `user-service`.

**Base URL**: `http://localhost/api/users`

## Authentication

All endpoints require authentication. You need to provide a valid JWT in the `Authorization` header of your requests.

`Authorization: Bearer <YOUR_JWT>`

The `/api/users` prefix is handled by the NGINX gateway, which then forwards the request to the `user-service`.

## Auth Routes

These routes are prefixed with `/auth`.

### POST /auth/verify

Verifies the user's authentication token.

- **Method**: `POST`
- **Endpoint**: `/api/users/auth/verify`
- **Description**: Confirms that the user's authentication token is valid.
- **Request Body**: None
- **Response**:
  - `200 OK`:
    ```json
    {
      "userId": "string"
    }
    ```
  - `401 Unauthorized`: If the token is invalid or missing.
  - `500 Internal Server Error`: For other server-side errors.

## User Routes

These routes are for managing user profiles, preferences, and stats.

### GET /me

Retrieves the profile of the currently authenticated user.

- **Method**: `GET`
- **Endpoint**: `/api/users/me`
- **Description**: Fetches the complete user object, including preferences and stats.
- **Request Body**: None
- **Response**:
  - `200 OK`: User object
    ```json
    {
      "id": "string",
      "email": "user@example.com",
      "name": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "A passionate reader.",
      "website": "https://johndoe.com",
      "isPublic": true,
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "status": "ACTIVE",
      "preferences": {
        "id": 1,
        "userId": "string",
        "theme": "DARK",
        "language": "en",
        "timezone": "America/New_York",
        "notificationsEmail": true,
        "notificationsSMS": false,
        "newsletterOptIn": true,
        "dailyDigest": true,
        "defaultSortOrder": "MOST_RECENT",
        "defaultViewMode": "CARD",
        "compactMode": false,
        "accessibilityFont": false,
        "reducedMotion": false,
        "autoPlayMedia": true,
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z"
      },
      "stats": {
        "id": 1,
        "userId": "string",
        "booksRead": 150,
        "pagesRead": 45000,
        "currentStreak": 30,
        "longestStreak": 60,
        "updatedAt": "2023-01-01T12:00:00Z",
        "createdAt": "2023-01-01T12:00:00Z"
      }
    }
    ```
  - `404 Not Found`: If the user is not found.

### PUT /me

Updates the profile of the currently authenticated user.

- **Method**: `PUT`
- **Endpoint**: `/api/users/me`
- **Description**: Updates user information based on the request body.
- **Request Body**: JSON object with fields to update.
  ```json
  {
    "name": "New Name",
    "email": "new.email@example.com",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "bio": "Updated bio.",
    "website": "https://newwebsite.com",
    "isPublic": false
  }
  ```
- **Response**:
  - `200 OK`: Updated user object.
    ```json
    {
      "id": "string",
      "email": "new.email@example.com",
      "name": "New Name",
      "avatarUrl": "https://example.com/new-avatar.jpg",
      "bio": "Updated bio.",
      "website": "https://newwebsite.com",
      "isPublic": false,
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:30:00Z",
      "status": "ACTIVE"
    }
    ```
  - `400 Bad Request`: If the input is invalid.
  - `401 Unauthorized`: If authentication token is missing or invalid.
  - `500 Internal Server Error`: For other server-side errors.

### GET /me/preferences

Retrieves the preferences of the currently authenticated user.

- **Method**: `GET`
- **Endpoint**: `/api/users/me/preferences`
- **Description**: Fetches the user's application preferences.
- **Request Body**: None
- **Response**:
  - `200 OK`: Preferences object.
    ```json
    {
      "id": 1,
      "userId": "string",
      "theme": "DARK",
      "language": "en",
      "timezone": "America/New_York",
      "notificationsEmail": true,
      "notificationsSMS": false,
      "newsletterOptIn": true,
      "dailyDigest": true,
      "defaultSortOrder": "MOST_RECENT",
      "defaultViewMode": "CARD",
      "compactMode": false,
      "accessibilityFont": false,
      "reducedMotion": false,
      "autoPlayMedia": true,
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    }
    ```
  - `404 Not Found`: If preferences are not set for the user.
  - `401 Unauthorized`: If authentication token is missing or invalid.
  - `500 Internal Server Error`: For other server-side errors.

### PUT /me/preferences

Updates or creates the preferences for the currently authenticated user.

- **Method**: `PUT`
- **Endpoint**: `/api/users/me/preferences`
- **Description**: Updates the user's preferences. If no preferences exist, they will be created.
- **Request Body**: JSON object with preference fields to update.
  ```json
  {
    "theme": "DARK",
    "language": "es",
    "timezone": "Europe/Madrid",
    "notificationsEmail": false,
    "notificationsSMS": true,
    "newsletterOptIn": false,
    "dailyDigest": false,
    "defaultSortOrder": "ALPHABETICAL",
    "defaultViewMode": "LIST",
    "compactMode": true,
    "accessibilityFont": true,
    "reducedMotion": true,
    "autoPlayMedia": false
  }
  ```
- **Response**:
  - `200 OK`: Updated preferences object.
    ```json
    {
      "id": 1,
      "userId": "string",
      "theme": "DARK",
      "language": "es",
      "timezone": "Europe/Madrid",
      "notificationsEmail": false,
      "notificationsSMS": true,
      "newsletterOptIn": false,
      "dailyDigest": false,
      "defaultSortOrder": "ALPHABETICAL",
      "defaultViewMode": "LIST",
      "compactMode": true,
      "accessibilityFont": true,
      "reducedMotion": true,
      "autoPlayMedia": false,
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:35:00Z"
    }
    ```
  - `400 Bad Request`: If the input is invalid.
  - `401 Unauthorized`: If authentication token is missing or invalid.
  - `500 Internal Server Error`: For other server-side errors.

### GET /me/stats

Retrieves the statistics of the currently authenticated user.

- **Method**: `GET`
- **Endpoint**: `/api/users/me/stats`
- **Description**: Fetches the user's reading statistics.
- **Request Body**: None
- **Response**:
  - `200 OK`: User stats object.
    ```json
    {
      "id": 1,
      "userId": "string",
      "booksRead": 150,
      "pagesRead": 45000,
      "currentStreak": 30,
      "longestStreak": 60,
      "updatedAt": "2023-01-01T12:00:00Z",
      "createdAt": "2023-01-01T12:00:00Z"
    }
    ```
  - `401 Unauthorized`: If authentication token is missing or invalid.
  - `500 Internal Server Error`: For other server-side errors.

## Admin Routes

These routes are for administrative actions and require `ADMIN` role privileges.

### PUT /users/:userId/status

Updates the status of a specific user (e.g., suspend, ban, deactivate).

- **Method**: `PUT`
- **Endpoint**: `/api/users/userId/status`
- **Description**: Allows administrators to change a user's status. Requires `ADMIN` role.
- **Path Parameters**:
  - `userId`: The ID of the user to update.
- **Request Body**: JSON object with the new status.
  ```json
  {
    "status": "SUSPENDED"
  }
  ```
  **Possible `status` values**: `ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED`
- **Response**:
  - `200 OK`: `{ "message": "User <userId> status updated to <status>" }`
  - `400 Bad Request`: If the input status is invalid.
  - `401 Unauthorized`: If authentication token is missing or invalid.
  - `403 Forbidden`: If the authenticated user does not have `ADMIN` role.
  - `500 Internal Server Error`: For other server-side errors.

### PUT /users/:userId/preferences/reset

Resets a specific user's preferences to their default values.

- **Method**: `PUT`
- **Endpoint**: `/api/users/userId/preferences/reset`
- **Description**: Allows administrators to reset a user's preferences. This effectively deletes the user's custom preferences, causing the system to use default values on next access. Requires `ADMIN` role.
- **Path Parameters**:
  - `userId`: The ID of the user whose preferences to reset.
- **Request Body**: None
- **Response**:
  - `200 OK`: `{ "message": "User preferences reset successfully." }`
  - `401 Unauthorized`: If authentication token is missing or invalid.
  - `403 Forbidden`: If the authenticated user does not have `ADMIN` role.
  - `500 Internal Server Error`: For other server-side errors.