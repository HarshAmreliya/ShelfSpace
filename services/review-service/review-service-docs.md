# Review Service API Documentation

This document outlines the API endpoints for the `review-service`.

**Base URL**: `http://localhost/api/reviews`

## Authentication

Some endpoints require authentication. For those, you need to provide a valid JWT in the `Authorization` header of your requests.

`Authorization: Bearer <YOUR_JWT>`

The `/api/reviews` prefix is handled by the NGINX gateway, which then forwards the request to the `review-service`.

## Review Routes

These routes are for managing book reviews.

### POST /

Creates a new review for a book.

- **Method**: `POST`
- **Endpoint**: `/api/reviews`
- **Authentication**: Required
- **Description**: Adds a new review to the database.
- **Request Body**: JSON object representing the review.
  ```json
  {
    "bookId": "clq4p5o5s0000c8e3b1z9e7k5",
    "rating": 5,
    "content": "This book was amazing!"
  }
  ```
- **Response**:
  - `201 Created`: The newly created review object.
  - `400 Bad Request`: If the request body is invalid.

### GET /book/:bookId

Retrieves all reviews for a specific book.

- **Method**: `GET`
- **Endpoint**: `/api/reviews/book/:bookId`
- **Authentication**: Not required
- **Description**: Fetches a paginated list of reviews for a given book ID.
- **URL Parameters**:
  - `bookId` (string, required): The ID of the book.
- **Query Parameters**:
  - `limit` (number, optional, default: 10): The number of reviews to return.
  - `offset` (number, optional, default: 0): The number of reviews to skip.
- **Response**:
  - `200 OK`: An array of review objects.

### GET /user/:userId

Retrieves all reviews written by a specific user.

- **Method**: `GET`
- **Endpoint**: `/api/reviews/user/:userId`
- **Authentication**: Not required
- **Description**: Fetches a paginated list of reviews for a given user ID.
- **URL Parameters**:
  - `userId` (string, required): The ID of the user.
- **Query Parameters**:
  - `limit` (number, optional, default: 10): The number of reviews to return.
  - `offset` (number, optional, default: 0): The number of reviews to skip.
- **Response**:
  - `200 OK`: An array of review objects.

### GET /:id

Retrieves a single review by its ID.

- **Method**: `GET`
- **Endpoint**: `/api/reviews/:id`
- **Authentication**: Not required
- **Description**: Fetches a single review by its unique ID.
- **URL Parameters**:
  - `id` (string, required): The ID of the review.
- **Response**:
  - `200 OK`: The review object.
  - `404 Not Found`: If the review is not found.

### PUT /:id

Updates an existing review.

- **Method**: `PUT`
- **Endpoint**: `/api/reviews/:id`
- **Authentication**: Required
- **Description**: Updates the content or rating of a review. The user must be the original author of the review.
- **URL Parameters**:
  - `id` (string, required): The ID of the review to update.
- **Request Body**: JSON object with the fields to update.
  ```json
  {
    "rating": 4,
    "content": "This book was pretty good, but not perfect."
  }
  ```
- **Response**:
  - `200 OK`: The updated review object.
  - `403 Forbidden`: If the user is not the author of the review.
  - `404 Not Found`: If the review is not found.

### DELETE /:id

Deletes a review.

- **Method**: `DELETE`
- **Endpoint**: `/api/reviews/:id`
- **Authentication**: Required
- **Description**: Deletes a review. The user must be the original author of the review.
- **URL Parameters**:
  - `id` (string, required): The ID of the review to delete.
- **Response**:
  - `204 No Content`: If the review was successfully deleted.
  - `403 Forbidden`: If the user is not the author of the review.
  - `404 Not Found`: If the review is not found.
