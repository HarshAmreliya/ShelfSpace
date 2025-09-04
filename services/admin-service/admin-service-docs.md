# Admin Service API Documentation

This document outlines the API endpoints for the `admin-service`.

**Base URL**: `http://localhost/api/admin`

## Authentication

All endpoints require authentication and admin privileges. You need to provide a valid JWT for an admin user in the `Authorization` header of your requests.

`Authorization: Bearer <YOUR_ADMIN_JWT>`

The `/api/admin` prefix is handled by the NGINX gateway, which then forwards the request to the `admin-service`.

## Admin Routes

These routes are for administrative tasks, such as moderation and content validation.

### POST /moderation/log

Logs a moderation action taken by an admin.

- **Method**: `POST`
- **Endpoint**: `/api/admin/moderation/log`
- **Authentication**: Required (Admin)
- **Description**: Creates a record of a moderation action.
- **Request Body**: JSON object representing the moderation log.
  ```json
  {
    "action": "DELETED_REVIEW",
    "targetId": "clq4p5o5s0000c8e3b1z9e7k5",
    "reason": "Inappropriate content."
  }
  ```
- **Response**:
  - `201 Created`: The newly created moderation log object.

### GET /moderation/logs

Retrieves all moderation logs.

- **Method**: `GET`
- **Endpoint**: `/api/admin/moderation/logs`
- **Authentication**: Required (Admin)
- **Description**: Fetches a paginated list of all moderation logs.
- **Query Parameters**:
  - `limit` (number, optional, default: 10): The number of logs to return.
  - `offset` (number, optional, default: 0): The number of logs to skip.
- **Response**:
  - `200 OK`: An array of moderation log objects.

### PUT /book-validation/:bookId

Updates the validation status of a book.

- **Method**: `PUT`
- **Endpoint**: `/api/admin/book-validation/:bookId`
- **Authentication**: Required (Admin)
- **Description**: Sets or updates the validation status of a book (e.g., marking it as verified).
- **URL Parameters**:
  - `bookId` (string, required): The ID of the book.
- **Request Body**: JSON object with the validation status.
  ```json
  {
    "status": "VERIFIED",
    "notes": "All information is correct."
  }
  ```
- **Response**:
  - `200 OK`: The updated book validation object.

### GET /book-validation/:bookId

Retrieves the validation status of a book.

- **Method**: `GET`
- **Endpoint**: `/api/admin/book-validation/:bookId`
- **Authentication**: Required (Admin)
- **Description**: Fetches the current validation status for a specific book.
- **URL Parameters**:
  - `bookId` (string, required): The ID of the book.
- **Response**:
  - `200 OK`: The book validation object.
  - `404 Not Found`: If no validation status is found for the book.
