# Interaction APIs

This document describes the social interaction APIs for the FileHub application, including like, bookmark, and follow functionality.

## Overview

The interaction APIs allow users to:
- **Like** documents (toggle on/off)
- **Bookmark** documents for later reference (toggle on/off)
- **Follow** other users to see their activities in the feed (toggle on/off)

All interactions are stored in `data/interactions.json` and corresponding activities are logged to `data/activity.json` for feed rendering.

## API Endpoints

### 1. Like Document

**POST** `/api/interactions/like`

Toggle like status for a document.

**Request Body:**
```json
{
  "documentId": "document-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "liked": true,
  "likeCount": 5,
  "message": "Document liked successfully"
}
```

### 2. Bookmark Document

**POST** `/api/interactions/bookmark`

Toggle bookmark status for a document.

**Request Body:**
```json
{
  "documentId": "document-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "bookmarked": true,
  "message": "Document bookmarked successfully"
}
```

### 3. Follow User

**POST** `/api/interactions/follow`

Toggle follow status for a user.

**Request Body:**
```json
{
  "targetUserId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "following": true,
  "followerCount": 12,
  "message": "User followed successfully"
}
```

### 4. Get Interaction Status

**GET** `/api/interactions/status?targetId={id}&targetType={document|user}`

Get the current interaction status for a target (document or user).

**Query Parameters:**
- `targetId`: ID of the document or user
- `targetType`: Either "document" or "user"

**Response:**
```json
{
  "liked": true,
  "bookmarked": false,
  "following": true,
  "likeCount": 5,
  "bookmarkCount": 2,
  "followerCount": 12
}
```

### 5. Get User Bookmarks

**GET** `/api/interactions/bookmarks?page={page}&limit={limit}`

Get paginated list of user's bookmarked documents.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "bookmarks": [
    {
      "id": "doc-uuid",
      "title": "Important Document",
      "type": "text/plain",
      "createdAt": "2023-...",
      "updatedAt": "2023-..."
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### 6. Get User Connections

**GET** `/api/interactions/connections?userId={userId}`

Get followers and following for a user.

**Query Parameters:**
- `userId`: Target user ID (optional, defaults to current user)

**Response:**
```json
{
  "followers": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-..."
    }
  ],
  "following": [
    {
      "id": "user-uuid2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2023-..."
    }
  ],
  "followerCount": 5,
  "followingCount": 3
}
```

### 7. Get Activity Feed

**GET** `/api/interactions/feed?page={page}&limit={limit}&includeOwn={boolean}`

Get personalized activity feed from followed users.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `includeOwn`: Include own activities (default: false)

**Response:**
```json
{
  "activities": [
    {
      "id": "activity-uuid",
      "userId": "user-uuid",
      "action": "document.liked",
      "entityType": "document",
      "entityId": "doc-uuid",
      "timestamp": "2023-12-07T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "avatarUrl": "https://..."
      },
      "document": {
        "id": "doc-uuid",
        "title": "Great Article",
        "type": "text/markdown"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

## Data Structure

### Interactions Storage (`data/interactions.json`)

```json
[
  {
    "id": "interaction-uuid",
    "userId": "user-uuid",
    "targetId": "document-or-user-uuid",
    "targetType": "document",
    "type": "like",
    "timestamp": "2023-12-07T10:30:00Z",
    "metadata": {
      "documentTitle": "Example Document"
    }
  }
]
```

### Activity Feed Storage (`data/activity.json`)

Activities are automatically created when interactions occur:

- `document.liked` / `document.unliked`
- `document.bookmarked`
- `user.followed` / `user.unfollowed`
- `user.gained_follower`

## Usage Examples

### Frontend Integration

```typescript
// Like a document
const likeDocument = async (documentId: string) => {
  const response = await fetch('/api/interactions/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId })
  });
  return response.json();
};

// Get interaction status
const getInteractionStatus = async (targetId: string, targetType: 'document' | 'user') => {
  const response = await fetch(`/api/interactions/status?targetId=${targetId}&targetType=${targetType}`);
  return response.json();
};

// Get activity feed
const getActivityFeed = async (page = 1, includeOwn = false) => {
  const response = await fetch(`/api/interactions/feed?page=${page}&includeOwn=${includeOwn}`);
  return response.json();
};
```

## Authentication

All interaction endpoints require authentication via JWT tokens. Users can only:
- Like/bookmark any document
- Follow any user (except themselves)
- View their own bookmarks and connections
- View activity feed based on who they follow

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific field error"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (missing fields, invalid data)
- `401`: Unauthorized (no valid token)
- `404`: Resource not found
- `405`: Method not allowed
- `500`: Internal server error
