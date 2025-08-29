# Group Service

This service is responsible for creating, joining, and managing reading groups.

## Endpoints

- `POST /api/groups`: Creates a new group.
- `GET /api/groups`: Retrieves all groups (paginated).
- `GET /api/groups/:id`: Retrieves a single group by its ID.
- `PUT /api/groups/:id`: Updates a group.
- `DELETE /api/groups/:id`: Deletes a group.
- `POST /api/groups/:id/join`: Joins the authenticated user to a group.
- `POST /api/groups/:id/leave`: Removes the authenticated user from a group.
- `GET /api/groups/:id/members`: Retrieves all members of a group.
- `GET /api/groups/:groupId/members/:userId/verify`: Verifies if a user is a member of a group (for inter-service communication).

## Analysis & Issues

1.  **Scaffolding:** This service was created from scratch with basic CRUD functionality for groups and group memberships.
2.  **Inter-Service Communication:** The service exposes a verification endpoint for other services to check group membership, which is a good pattern.
3.  **Incomplete Authorization:** The routes for updating and deleting groups have `TODO` comments indicating that authorization logic is missing. Currently, any authenticated user can update or delete any group.

## Suggestions

1.  **Implement Role-Based Authorization:** Complete the authorization logic. Only users with the `ADMIN` role in a group should be able to update or delete the group.
2.  **Add Member Management Endpoints:** Add endpoints for group admins to manage members, such as:
    - `DELETE /api/groups/:groupId/members/:userId`: To remove a user from a group.
    - `PUT /api/groups/:groupId/members/:userId`: To change a user's role (e.g., promote to admin).
3.  **Enrich Group Details:** The `GET /api/groups/:id` endpoint could be enhanced to return more detailed information about the members by communicating with the `user-service` to fetch user profiles.

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

### Group Management

#### `POST /groups`

Creates a new reading group.

**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "name": "My Awesome Book Club",
  "description": "A group for discussing fantasy novels.",
  "isPublic": true
}
```

**Response:**

-   **201 Created:** The created group object.
-   **400 Bad Request:** If the request body is invalid.

#### `GET /groups`

Retrieves a paginated list of all public groups.

**Authentication:** Optional (Bearer Token)

**Query Parameters:**

-   `limit` (optional, number): Maximum number of groups to retrieve (default: 10).
-   `offset` (optional, number): Number of groups to skip (default: 0).

**Response:**

-   **200 OK:** An array of group objects.

    ```json
    [
      {
        "id": "clx...",
        "name": "My Awesome Book Club",
        "description": "A group for discussing fantasy novels.",
        "isPublic": true,
        "createdAt": "2025-08-23T10:00:00.000Z",
        "ownerId": "clx..."
      }
    ]
    ```

#### `GET /groups/:id`

Retrieves a single group by its ID.

**Authentication:** Required (Bearer Token)

**Path Parameters:**

-   `id` (string): The ID of the group.

**Response:**

-   **200 OK:** The group object.
-   **404 Not Found:** If the group does not exist.

#### `PUT /groups/:id`

Updates a group's details.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the group owner can update the group.

**Path Parameters:**

-   `id` (string): The ID of the group.

**Request Body:**

```json
{
  "name": "Updated Book Club Name",
  "description": "New description.",
  "isPublic": false
}
```

**Response:**

-   **200 OK:** The updated group object.
-   **400 Bad Request:** If the request body is invalid.
-   **403 Forbidden:** If the user is not the group owner.
-   **404 Not Found:** If the group does not exist.

#### `DELETE /groups/:id`

Deletes a group.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the group owner can delete the group.

**Path Parameters:**

-   `id` (string): The ID of the group.

**Response:**

-   **204 No Content:** If the group was successfully deleted.
-   **403 Forbidden:** If the user is not the group owner.
-   **404 Not Found:** If the group does not exist.

### Group Membership

#### `POST /groups/:id/join`

Allows the authenticated user to join a public group or send a join request to a private group.

**Authentication:** Required (Bearer Token)

**Path Parameters:**

-   `id` (string): The ID of the group.

**Response:**

-   **200 OK:** If the user successfully joined (public group).
-   **202 Accepted:** If a join request was sent (private group).
-   **400 Bad Request:** If the user is already a member or has a pending request.
-   **404 Not Found:** If the group does not exist.

#### `POST /groups/:id/leave`

Removes the authenticated user from a group.

**Authentication:** Required (Bearer Token)

**Path Parameters:**

-   `id` (string): The ID of the group.

**Response:**

-   **204 No Content:** If the user successfully left the group.
-   **400 Bad Request:** If the user is not a member of the group.
-   **404 Not Found:** If the group does not exist.

#### `GET /groups/:id/members`

Retrieves a list of all members of a group.

**Authentication:** Required (Bearer Token)

**Authorization:** User must be a member of the group.

**Path Parameters:**

-   `id` (string): The ID of the group.

**Response:**

-   **200 OK:** An array of group member objects.

    ```json
    [
      {
        "userId": "clx...",
        "groupId": "clx...",
        "role": "ADMIN",
        "joinedAt": "2025-08-23T10:00:00.000Z"
      }
    ]
    ```

#### `GET /groups/:groupId/members/:userId/verify`

Verifies if a user is a member of a specific group. This endpoint is primarily for inter-service communication.

**Authentication:** Required (Bearer Token)

**Path Parameters:**

-   `groupId` (string): The ID of the group.
-   `userId` (string): The ID of the user.

**Response:**

-   **200 OK:**

    ```json
    {
      "isMember": true
    }
    ```

-   **401 Unauthorized:** If no valid token is provided.
-   **403 Forbidden:** If the token is valid but the user is not authorized to perform this check (e.g., not an internal service).

### Join Requests

#### `GET /groups/:id/join-requests`

Retrieves all pending join requests for a private group.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the group owner or admin can view join requests.

**Path Parameters:**

-   `id` (string): The ID of the group.

**Response:**

-   **200 OK:** An array of join request objects.

    ```json
    [
      {
        "id": "clx...",
        "groupId": "clx...",
        "userId": "clx...",
        "requestedAt": "2025-08-23T10:00:00.000Z"
      }
    ]
    ```

#### `POST /groups/:groupId/join-requests/:requestId/accept`

Accepts a pending join request, adding the user to the group.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the group owner or admin can accept join requests.

**Path Parameters:**

-   `groupId` (string): The ID of the group.
-   `requestId` (string): The ID of the join request.

**Response:**

-   **200 OK:** The updated join request object (now accepted).
-   **404 Not Found:** If the group or join request does not exist.
-   **403 Forbidden:** If the user is not authorized.

#### `POST /groups/:groupId/join-requests/:requestId/reject`

Rejects a pending join request.

**Authentication:** Required (Bearer Token)

**Authorization:** Only the group owner or admin can reject join requests.

**Path Parameters:**

-   `groupId` (string): The ID of the group.
-   `requestId` (string): The ID of the join request.

**Response:**

-   **200 OK:** The updated join request object (now rejected).
-   **404 Not Found:** If the group or join request does not exist.
-   **403 Forbidden:** If the user is not authorized.

#### `POST /groups/:groupId/join-requests/:requestId/cancel`

Cancels a pending join request (can be done by the requesting user).

**Authentication:** Required (Bearer Token)

**Authorization:** Only the requesting user can cancel their own request.

**Path Parameters:**

-   `groupId` (string): The ID of the group.
-   `requestId` (string): The ID of the join request.

**Response:**

-   **200 OK:** The updated join request object (now cancelled).
-   **404 Not Found:** If the group or join request does not exist.
-   **403 Forbidden:** If the user is not authorized.