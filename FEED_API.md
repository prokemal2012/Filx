# Activity Feed API

## Endpoint: `/api/feed`

The activity feed API returns recent activity concerning the authenticated user, including activities from followers and followed users, aggregated and sorted by date.

### Method
`GET`

### Authentication
Requires JWT authentication via cookies. The user must be logged in.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Maximum number of activities to return |
| `offset` | integer | 0 | Number of activities to skip (for pagination) |

### Response Format

```json
{
  "activities": [
    {
      "id": "string",
      "userId": "string", 
      "action": "string",
      "entityType": "user" | "document" | "interaction",
      "entityId": "string",
      "timestamp": "ISO-8601 date string",
      "details": {},
      "user": {
        "id": "string",
        "name": "string",
        "avatarUrl": "string?"
      },
      "document": {
        "id": "string",
        "title": "string", 
        "type": "string"
      },
      "targetUser": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "total": 0,
  "hasMore": false
}
```

### How It Works

1. **Authentication**: Verifies the user is authenticated via JWT cookie
2. **Social Graph**: Identifies relevant users by finding:
   - Users that the current user follows
   - Users that follow the current user (followers)
3. **Activity Filtering**: Fetches activities from the relevant users
4. **Sorting**: Sorts activities by timestamp (most recent first)
5. **Pagination**: Applies limit and offset for pagination
6. **Enrichment**: Adds user details, document details (if applicable), and target user details (for user-related activities)

### Example Usage

```javascript
// Fetch the first 10 activities
fetch('/api/feed?limit=10&offset=0')
  .then(response => response.json())
  .then(data => {
    console.log('Activities:', data.activities);
    console.log('Total:', data.total);
    console.log('Has more:', data.hasMore);
  });

// Fetch next 10 activities
fetch('/api/feed?limit=10&offset=10')
  .then(response => response.json())
  .then(data => {
    // Append to existing activities for infinite scroll
  });
```

### Error Responses

- **401 Unauthorized**: User is not authenticated
- **405 Method Not Allowed**: Request method is not GET
- **500 Internal Server Error**: Server error occurred

### Activity Types

The feed includes various types of activities:
- **Document activities**: Document creation, updates, sharing
- **User activities**: Following other users, profile updates
- **Interaction activities**: Likes, bookmarks, comments

All activities are enriched with relevant user and entity information for easy display in the UI.
