# Admin Service

This service is responsible for administrative tasks such as content moderation and book validation.

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

## API Endpoints

All endpoints are prefixed with `/api` and require admin privileges.

### Moderation

#### `POST /moderation/log`

Logs a moderation action.

**Request Body:**

```json
{
  "action": "DELETE_REVIEW",
  "targetType": "REVIEW",
  "targetId": "clx...",
  "reason": "Spam content"
}
```

**Response:**

-   **201 Created:** The created moderation log object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /moderation/logs`

Retrieves a paginated list of moderation logs.

**Query Parameters:**

-   `limit` (optional, default: 10)
-   `offset` (optional, default: 0)

**Response:**

-   **200 OK:**

    ```json
    [
      {
        "id": "clx...",
        "moderatorId": "clx...",
        "action": "DELETE_REVIEW",
        "targetType": "REVIEW",
        "targetId": "clx...",
        "reason": "Spam content",
        "timestamp": "2025-08-23T10:00:00.000Z"
      }
    ]
    ```

### Book Validation

#### `PUT /book-validation/:bookId`

Updates the validation status of a book.

**Request Body:**

```json
{
  "status": "VALIDATED",
  "notes": "The book information is correct."
}
```

**Response:**

-   **200 OK:** The updated book validation object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /book-validation/:bookId`

Retrieves the validation status of a book.

**Response:**

-   **200 OK:**

    ```json
    {
      "id": "clx...",
      "bookId": "clx...",
      "status": "VALIDATED",
      "notes": "The book information is correct.",
      "validatorId": "clx...",
      "timestamp": "2025-08-23T10:00:00.000Z"
    }
    ```

-   **404 Not Found:** If the book validation status is not found.