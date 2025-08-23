# User Service

This service is responsible for managing user profiles, preferences, stats, and authentication.

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

All endpoints are prefixed with `/api`.

### Authentication

#### `POST /auth/verify`

Verifies a JWT and returns the user ID. This endpoint is intended for use by other services within the microservices architecture to authenticate and authorize internal requests.

**Request:**

-   **Headers:**
    -   `Authorization: Bearer <token>`

**Response:**

-   **200 OK:**

    ```json
    {
      "userId": "clx..."
    }
    ```

-   **401 Unauthorized:** If the token is missing, invalid, or expired.

### User

All user-related endpoints require authentication.

#### `GET /me`

Retrieves the profile of the authenticated user.

**Response:**

-   **200 OK:**

    ```json
    {
      "id": "clx...",
      "name": "The Hero of Ages",
      "email": "hero@example.com",
      "avatarUrl": "https://...",
      "bio": "...",
      "website": "https://...",
      "isPublic": true,
      "preferences": { ... },
      "stats": { ... }
    }
    ```

#### `PUT /me`

Updates the profile of the authenticated user.

**Request Body:**

```json
{
  "name": "New Name",
  "avatarUrl": "https://...",
  "bio": "...",
  "website": "https://...",
  "isPublic": false
}
```

**Response:**

-   **200 OK:** The updated user object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /me/preferences`

Retrieves the preferences of the authenticated user.

**Response:**

-   **200 OK:**

    ```json
    {
      "theme": "DARK",
      "language": "en",
      ...
    }
    ```

#### `PUT /me/preferences`

Updates the preferences of the authenticated user.

**Request Body:**

```json
{
  "theme": "LIGHT",
  "language": "fr"
}
```

**Response:**

-   **200 OK:** The updated preferences object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /me/stats`

Retrieves the stats of the authenticated user.

**Response:**

-   **200 OK:**

    ```json
    {
      "booksRead": 10,
      "pagesRead": 3000,
      "currentStreak": 5,
      "longestStreak": 10
    }
    ```