# Group Service API Documentation

This document outlines the API endpoints for the `group-service`.

**Base URL**: `http://localhost/api/groups`

## Authentication

Some endpoints require authentication. For those, you need to provide a valid JWT in the `Authorization` header of your requests.

`Authorization: Bearer <YOUR_JWT>`

The `/api/groups` prefix is handled by the NGINX gateway, which then forwards the request to the `group-service`.

## Group Routes

These routes are for managing reading groups and memberships.

### POST /

Creates a new group.

- **Method**: `POST`
- **Endpoint**: `/api/groups`
- **Authentication**: Required
- **Description**: Creates a new group and automatically makes the creator an admin.
- **Request Body**: JSON object representing the group.
  ```json
  {
    "name": "The Bookworms",
    "description": "A group for avid readers."
  }
  ```
- **Response**:
  - `201 Created`: The newly created group object, including memberships.

### GET /

Retrieves all groups.

- **Method**: `GET`
- **Endpoint**: `/api/groups`
- **Authentication**: Not required
- **Description**: Fetches a paginated list of all groups.
- **Query Parameters**:
  - `limit` (number, optional, default: 10): The number of groups to return.
  - `offset` (number, optional, default: 0): The number of groups to skip.
- **Response**:
  - `200 OK`: An array of group objects.

### GET /:id

Retrieves a single group by its ID.

- **Method**: `GET`
- **Endpoint**: `/api/groups/:id`
- **Authentication**: Not required
- **Description**: Fetches a single group by its unique ID, including its members.
- **URL Parameters**:
  - `id` (string, required): The ID of the group.
- **Response**:
  - `200 OK`: The group object with memberships.
  - `404 Not Found`: If the group is not found.

### PUT /:id

Updates an existing group.

- **Method**: `PUT`
- **Endpoint**: `/api/groups/:id`
- **Authentication**: Required
- **Description**: Updates the details of a group. The user must be an admin of the group.
- **URL Parameters**:
  - `id` (string, required): The ID of the group to update.
- **Request Body**: JSON object with the fields to update.
  ```json
  {
    "name": "The New Bookworms",
    "description": "An updated description."
  }
  ```
- **Response**:
  - `200 OK`: The updated group object.
  - `403 Forbidden`: If the user is not an admin of the group.
  - `404 Not Found`: If the group is not found.

### DELETE /:id

Deletes a group.

- **Method**: `DELETE`
- **Endpoint**: `/api/groups/:id`
- **Authentication**: Required
- **Description**: Deletes a group. The user must be an admin of the group.
- **URL Parameters**:
  - `id` (string, required): The ID of the group to delete.
- **Response**:
  - `204 No Content`: If the group was successfully deleted.
  - `403 Forbidden`: If the user is not an admin of the group.
  - `404 Not Found`: If the group is not found.

### POST /:id/join

Joins a group.

- **Method**: `POST`
- **Endpoint**: `/api/groups/:id/join`
- **Authentication**: Required
- **Description**: Adds the authenticated user to a group as a member.
- **URL Parameters**:
  - `id` (string, required): The ID of the group to join.
- **Response**:
  - `201 Created`: The new group membership object.

### POST /:id/leave

Leaves a group.

- **Method**: `POST`
- **Endpoint**: `/api/groups/:id/leave`
- **Authentication**: Required
- **Description**: Removes the authenticated user from a group.
- **URL Parameters**:
  - `id` (string, required): The ID of the group to leave.
- **Response**:
  - `204 No Content`: If the user successfully left the group.

### GET /:id/members

Retrieves all members of a group.

- **Method**: `GET`
- **Endpoint**: `/api/groups/:id/members`
- **Authentication**: Not required
- **Description**: Fetches a list of all members in a specific group.
- **URL Parameters**:
  - `id` (string, required): The ID of the group.
- **Response**:
  - `200 OK`: An array of group membership objects.

### GET /:groupId/members/:userId/verify

Verifies if a user is a member of a group.

- **Method**: `GET`
- **Endpoint**: `/api/groups/:groupId/members/:userId/verify`
- **Authentication**: Not required
- **Description**: Checks if a given user is a member of a given group.
- **URL Parameters**:
  - `groupId` (string, required): The ID of the group.
  - `userId` (string, required): The ID of the user.
- **Response**:
  - `200 OK`: `{ "isMember": true }`
  - `404 Not Found`: If the membership is not found.
