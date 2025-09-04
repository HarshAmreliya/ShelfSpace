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
  - `200 OK`: `{ "userId": "string" }`
  - `401 Unauthorized`: If the token is invalid or missing.

## User Routes

These routes are for managing user profiles, preferences, and stats.

### GET /me

Retrieves the profile of the currently authenticated user.

- **Method**: `GET`
- **Endpoint**: `/api/users/me`
- **Description**: Fetches the complete user object, including preferences and stats.
- **Response**:
  - `200 OK`: User object
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
    "email": "new.email@example.com"
  }
  ```
- **Response**:
  - `200 OK`: Updated user object.

### GET /me/preferences

Retrieves the preferences of the currently authenticated user.

- **Method**: `GET`
- **Endpoint**: `/api/users/me/preferences`
- **Description**: Fetches the user's application preferences.
- **Response**:
  - `200 OK`: Preferences object.
  - `404 Not Found`: If preferences are not set for the user.

### PUT /me/preferences

Updates or creates the preferences for the currently authenticated user.

- **Method**: `PUT`
- **Endpoint**: `/api/users/me/preferences`
- **Description**: Updates the user's preferences. If no preferences exist, they will be created.
- **Request Body**: JSON object with preference fields to update.
  ```json
  {
    "theme": "dark",
    "notifications": {
      "newFollower": true,
      "groupInvite": true
    }
  }
  ```
- **Response**:
  - `200 OK`: Updated preferences object.

### GET /me/stats

Retrieves the statistics of the currently authenticated user.

- **Method**: `GET`
- **Endpoint**: `/api/users/me/stats`
- **Description**: Fetches the user's reading statistics.
- **Response**:
  - `200 OK`: User stats object.
