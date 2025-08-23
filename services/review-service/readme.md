# Review Service

This service is responsible for managing book reviews and ratings.

## Endpoints

- `POST /api/reviews`: Creates a new review.
- `GET /api/reviews/book/:bookId`: Retrieves all reviews for a specific book (paginated).
- `GET /api/reviews/user/:userId`: Retrieves all reviews from a specific user (paginated).
- `GET /api/reviews/:id`: Retrieves a single review by its ID.
- `PUT /api/reviews/:id`: Updates a review.
- `DELETE /api/reviews/:id`: Deletes a review.

## Analysis & Issues

1.  **Security:** The service has been updated to include authentication and authorization. Users can only create reviews for themselves, and can only update or delete their own reviews.
2.  **Pagination:** The endpoints that return lists of reviews have been updated with pagination.
3.  **Lack of Tests:** The `package.json` file does not have a `test` script, and there are no test files in the service. This makes it risky to add new features or refactor existing code.
4.  **Unused `tldr` Field:** The `Review` model in the database has a `tldr` (Too Long; Didn't Read) field, but there is no logic to automatically generate these summaries.

## Suggestions

1.  **Implement a Test Suite:** This is the highest priority. Add a testing framework like Jest or Vitest and write unit and integration tests for the API endpoints to ensure correctness and prevent regressions.
2.  **Automated TL;DR Summaries:** Integrate with the `llm-service` (once it's available) to automatically generate a concise summary for each new review and store it in the `tldr` field.
3.  **Review Analytics:** Add an endpoint (e.g., `GET /api/reviews/book/:bookId/stats`) that returns aggregate data for a book, such as its average rating and the total number of reviews. This would be more efficient than calculating it on the frontend.
4.  **Refactor Error Handling:** Create a centralized error-handling middleware in Express to reduce code duplication in the route handlers and provide a consistent error response format.

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

### Reviews

#### `POST /reviews`

Creates a new review for a book.

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "bookId": "clx...",
  "rating": 5,
  "reviewText": "This book was amazing!"
}
```

**Response:**

-   **201 Created:** The created review object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /reviews/book/:bookId`

Retrieves all reviews for a specific book.

**Path Parameters:**

-   `bookId` (string): The ID of the book.

**Query Parameters:**

-   `limit` (optional, number): Maximum number of reviews to retrieve (default: 10).
-   `offset` (optional, number): Number of reviews to skip (default: 0).

**Response:**

-   **200 OK:** An array of review objects.

    ```json
    [
      {
        "id": "clx...",
        "bookId": "clx...",
        "userId": "clx...",
        "rating": 5,
        "reviewText": "This book was amazing!",
        "createdAt": "2025-08-23T10:00:00.000Z"
      }
    ]
    ```

#### `GET /reviews/user/:userId`

Retrieves all reviews by a specific user.

**Path Parameters:**

-   `userId` (string): The ID of the user.

**Query Parameters:**

-   `limit` (optional, number): Maximum number of reviews to retrieve (default: 10).
-   `offset` (optional, number): Number of reviews to skip (default: 0).

**Response:**

-   **200 OK:** An array of review objects.

#### `GET /reviews/:id`

Retrieves a single review by its ID.

**Path Parameters:**

-   `id` (string): The ID of the review.

**Response:**

-   **200 OK:** The review object.
-   **404 Not Found:** If the review does not exist.

#### `PUT /reviews/:id`

Updates an existing review.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the owner of the review can update it.

**Path Parameters:**

-   `id` (string): The ID of the review.

**Request Body:**

```json
{
  "rating": 4,
  "reviewText": "It was good, but not amazing."
}
```

**Response:**

-   **200 OK:** The updated review object.
-   **400 Bad Request:** If the request body is invalid.
-   **403 Forbidden:** If the user is not the owner of the review.
-   **404 Not Found:** If the review does not exist.

#### `DELETE /reviews/:id`

Deletes a review.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the owner of the review can delete it.

**Path Parameters:**

-   `id` (string): The ID of the review.

**Response:**

-   **204 No Content:** If the review was successfully deleted.
-   **403 Forbidden:** If the user is not the owner of the review.
-   **404 Not Found:** If the review does not exist.

### Ratings

#### `POST /ratings`

Creates a new rating for a book.

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "bookId": "clx...",
  "value": 5
}
```

**Response:**

-   **201 Created:** The created rating object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /ratings/book/:bookId`

Retrieves all ratings for a specific book.

**Path Parameters:**

-   `bookId` (string): The ID of the book.

**Response:**

-   **200 OK:** An array of rating objects.

#### `GET /ratings/user/:userId`

Retrieves all ratings by a specific user.

**Path Parameters:**

-   `userId` (string): The ID of the user.

**Response:**

-   **200 OK:** An array of rating objects.

#### `GET /ratings/:id`

Retrieves a single rating by its ID.

**Path Parameters:**

-   `id` (string): The ID of the rating.

**Response:**

-   **200 OK:** The rating object.
-   **404 Not Found:** If the rating does not exist.

#### `PUT /ratings/:id`

Updates an existing rating.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the owner of the rating can update it.

**Path Parameters:**

-   `id` (string): The ID of the rating.

**Request Body:**

```json
{
  "value": 4
}
```

**Response:**

-   **200 OK:** The updated rating object.
-   **400 Bad Request:** If the request body is invalid.
-   **403 Forbidden:** If the user is not the owner of the rating.
-   **404 Not Found:** If the rating does not exist.

#### `DELETE /ratings/:id`

Deletes a rating.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the owner of the rating can delete it.

**Path Parameters:**

-   `id` (string): The ID of the rating.

**Response:**

-   **204 No Content:** If the rating was successfully deleted.
-   **403 Forbidden:** If the user is not the owner of the rating.
-   **404 Not Found:** If the rating does not exist.

### Summaries

#### `POST /summaries`

Creates a new TL;DR summary for a book.

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "bookId": "clx...",
  "summaryText": "A concise summary of the book."
}
```

**Response:**

-   **201 Created:** The created summary object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /summaries/book/:bookId`

Retrieves all summaries for a specific book.

**Path Parameters:**

-   `bookId` (string): The ID of the book.

**Response:**

-   **200 OK:** An array of summary objects.

#### `GET /summaries/user/:userId`

Retrieves all summaries by a specific user.

**Path Parameters:**

-   `userId` (string): The ID of the user.

**Response:**

-   **200 OK:** An array of summary objects.

#### `GET /summaries/:id`

Retrieves a single summary by its ID.

**Path Parameters:**

-   `id` (string): The ID of the summary.

**Response:**

-   **200 OK:** The summary object.
-   **404 Not Found:** If the summary does not exist.

#### `PUT /summaries/:id`

Updates an existing summary.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the owner of the summary can update it.

**Path Parameters:**

-   `id` (string): The ID of the summary.

**Request Body:**

```json
{
  "summaryText": "An updated concise summary."
}
```

**Response:**

-   **200 OK:** The updated summary object.
-   **400 Bad Request:** If the request body is invalid.
-   **403 Forbidden:** If the user is not the owner of the summary.
-   **404 Not Found:** If the summary does not exist.

#### `DELETE /summaries/:id`

Deletes a summary.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the owner of the summary can delete it.

**Path Parameters:**

-   `id` (string): The ID of the summary.

**Response:**

-   **204 No Content:** If the summary was successfully deleted.
-   **403 Forbidden:** If the user is not the owner of the summary.
-   **404 Not Found:** If the summary does not exist.