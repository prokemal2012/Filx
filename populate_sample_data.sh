#!/bin/bash

# Create sample data for testing enhanced APIs

# Create data directory if it doesn't exist
mkdir -p data

# Sample users with more diverse profiles
cat > data/users.json << 'EOF'
[
  {
    "email": "test@example.com",
    "name": "Test User",
    "password": "$2b$10$4NXr3cUSsuUDIG9uLFiQFuneQ5FPGEACGn6SBmuwiQkB53NmM.hEG",
    "id": "d0721b90-db82-4367-8909-74344287aece",
    "createdAt": "2025-07-27T10:22:36.374Z",
    "lastLoginAt": "2025-07-29T08:59:00.000Z",
    "bio": "A test user exploring the platform",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
    "stats": {
      "documentsCount": 3,
      "followersCount": 2,
      "followingCount": 1,
      "likesReceived": 8
    }
  },
  {
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "password": "$2b$10$9XBShqLud35XqJwmNHPeEevM7Kn9p/oZj8B0RHutFUzNAoNnNg7rm",
    "id": "alice-user-id",
    "createdAt": "2025-07-25T14:30:00.000Z",
    "lastLoginAt": "2025-07-29T07:45:00.000Z",
    "bio": "Content creator and technology enthusiast",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    "stats": {
      "documentsCount": 8,
      "followersCount": 15,
      "followingCount": 3,
      "likesReceived": 24
    }
  },
  {
    "email": "bob@example.com",
    "name": "Bob Smith",
    "password": "$2b$10$9XBShqLud35XqJwmNHPeEevM7Kn9p/oZj8B0RHutFUzNAoNnNg7rm",
    "id": "bob-user-id",
    "createdAt": "2025-07-26T09:15:00.000Z",
    "lastLoginAt": "2025-07-29T06:20:00.000Z",
    "bio": "Developer and open source contributor",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    "stats": {
      "documentsCount": 12,
      "followersCount": 8,
      "followingCount": 5,
      "likesReceived": 31
    }
  },
  {
    "email": "carol@example.com",
    "name": "Carol Williams",
    "password": "$2b$10$9XBShqLud35XqJwmNHPeEevM7Kn9p/oZj8B0RHutFUzNAoNnNg7rm",
    "id": "carol-user-id",
    "createdAt": "2025-07-24T16:45:00.000Z",
    "lastLoginAt": "2025-07-28T19:30:00.000Z",
    "bio": "Designer and creative writer",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    "stats": {
      "documentsCount": 6,
      "followersCount": 12,
      "followingCount": 7,
      "likesReceived": 18
    }
  }
]
EOF

# Sample documents with various categories and content
cat > data/documents.json << 'EOF'
[
  {
    "id": "doc-1",
    "userId": "alice-user-id",
    "title": "Getting Started with React Hooks",
    "content": "A comprehensive guide to React Hooks and their practical applications in modern web development.",
    "description": "Learn how to use React Hooks effectively in your projects",
    "type": "text/markdown",
    "size": 2048,
    "createdAt": "2025-07-28T14:30:00.000Z",
    "updatedAt": "2025-07-28T14:30:00.000Z",
    "tags": ["react", "javascript", "hooks", "tutorial"],
    "fileName": "react-hooks-guide.md",
    "filePath": "/uploads/react-hooks-guide.md",
    "isPublic": true,
    "category": "Programming",
    "viewCount": 45,
    "downloadCount": 12
  },
  {
    "id": "doc-2",
    "userId": "bob-user-id",
    "title": "Machine Learning Fundamentals",
    "content": "Introduction to machine learning concepts, algorithms, and practical implementations.",
    "description": "Basic concepts every ML beginner should know",
    "type": "application/pdf",
    "size": 5120,
    "createdAt": "2025-07-27T10:15:00.000Z",
    "updatedAt": "2025-07-27T10:15:00.000Z",
    "tags": ["machine-learning", "ai", "python", "fundamentals"],
    "fileName": "ml-fundamentals.pdf",
    "filePath": "/uploads/ml-fundamentals.pdf",
    "isPublic": true,
    "category": "Data Science",
    "viewCount": 67,
    "downloadCount": 23
  },
  {
    "id": "doc-3",
    "userId": "carol-user-id",
    "title": "UI/UX Design Principles",
    "content": "Essential design principles for creating user-friendly interfaces and experiences.",
    "description": "Key principles for better user experience design",
    "type": "text/markdown",
    "size": 3072,
    "createdAt": "2025-07-29T08:20:00.000Z",
    "updatedAt": "2025-07-29T08:20:00.000Z",
    "tags": ["design", "ux", "ui", "principles"],
    "fileName": "design-principles.md",
    "filePath": "/uploads/design-principles.md",
    "isPublic": true,
    "category": "Design",
    "viewCount": 89,
    "downloadCount": 15
  },
  {
    "id": "doc-4",
    "userId": "alice-user-id",
    "title": "Node.js Best Practices",
    "content": "Collection of best practices for Node.js development and deployment.",
    "description": "Improve your Node.js applications with these proven practices",
    "type": "text/markdown",
    "size": 4096,
    "createdAt": "2025-07-26T16:45:00.000Z",
    "updatedAt": "2025-07-26T16:45:00.000Z",
    "tags": ["nodejs", "javascript", "backend", "best-practices"],
    "fileName": "nodejs-best-practices.md",
    "filePath": "/uploads/nodejs-best-practices.md",
    "isPublic": true,
    "category": "Programming",
    "viewCount": 34,
    "downloadCount": 8
  },
  {
    "id": "doc-5",
    "userId": "bob-user-id",
    "title": "Data Visualization with D3.js",
    "content": "Creating interactive data visualizations using D3.js library.",
    "description": "Learn to create stunning data visualizations",
    "type": "text/html",
    "size": 6144,
    "createdAt": "2025-07-25T12:30:00.000Z",
    "updatedAt": "2025-07-25T12:30:00.000Z",
    "tags": ["d3js", "visualization", "data", "javascript"],
    "fileName": "d3-visualization.html",
    "filePath": "/uploads/d3-visualization.html",
    "isPublic": true,
    "category": "Data Science",
    "viewCount": 56,
    "downloadCount": 19
  },
  {
    "id": "doc-6",
    "userId": "carol-user-id",
    "title": "Creative Writing Workshop",
    "content": "Exercises and techniques for improving creative writing skills.",
    "description": "Unleash your creativity with these writing exercises",
    "type": "application/pdf",
    "size": 2560,
    "createdAt": "2025-07-29T06:00:00.000Z",
    "updatedAt": "2025-07-29T06:00:00.000Z",
    "tags": ["writing", "creativity", "workshop", "literature"],
    "fileName": "creative-writing.pdf",
    "filePath": "/uploads/creative-writing.pdf",
    "isPublic": true,
    "category": "Education",
    "viewCount": 28,
    "downloadCount": 7
  }
]
EOF

# Sample interactions (likes, bookmarks, follows)
cat > data/interactions.json << 'EOF'
[
  {
    "id": "int-1",
    "userId": "d0721b90-db82-4367-8909-74344287aece",
    "targetId": "doc-1",
    "targetType": "document",
    "type": "like",
    "timestamp": "2025-07-28T15:00:00.000Z"
  },
  {
    "id": "int-2",
    "userId": "bob-user-id",
    "targetId": "doc-1",
    "targetType": "document",
    "type": "like",
    "timestamp": "2025-07-28T16:30:00.000Z"
  },
  {
    "id": "int-3",
    "userId": "carol-user-id",
    "targetId": "doc-2",
    "targetType": "document",
    "type": "like",
    "timestamp": "2025-07-27T14:20:00.000Z"
  },
  {
    "id": "int-4",
    "userId": "d0721b90-db82-4367-8909-74344287aece",
    "targetId": "doc-3",
    "targetType": "document",
    "type": "bookmark",
    "timestamp": "2025-07-29T09:15:00.000Z"
  },
  {
    "id": "int-5",
    "userId": "alice-user-id",
    "targetId": "doc-3",
    "targetType": "document",
    "type": "like",
    "timestamp": "2025-07-29T10:00:00.000Z"
  },
  {
    "id": "int-6",
    "userId": "d0721b90-db82-4367-8909-74344287aece",
    "targetId": "alice-user-id",
    "targetType": "user",
    "type": "follow",
    "timestamp": "2025-07-28T12:00:00.000Z"
  },
  {
    "id": "int-7",
    "userId": "bob-user-id",
    "targetId": "carol-user-id",
    "targetType": "user",
    "type": "follow",
    "timestamp": "2025-07-27T18:30:00.000Z"
  },
  {
    "id": "int-8",
    "userId": "carol-user-id",
    "targetId": "alice-user-id",
    "targetType": "user",
    "type": "follow",
    "timestamp": "2025-07-26T11:45:00.000Z"
  }
]
EOF

# Sample activities
cat > data/activity.json << 'EOF'
[
  {
    "id": "act-1",
    "userId": "alice-user-id",
    "action": "document_created",
    "entityType": "document",
    "entityId": "doc-1",
    "timestamp": "2025-07-28T14:30:00.000Z",
    "details": {
      "title": "Getting Started with React Hooks",
      "category": "Programming"
    }
  },
  {
    "id": "act-2",
    "userId": "bob-user-id",
    "action": "document_created",
    "entityType": "document",
    "entityId": "doc-2",
    "timestamp": "2025-07-27T10:15:00.000Z",
    "details": {
      "title": "Machine Learning Fundamentals",
      "category": "Data Science"
    }
  },
  {
    "id": "act-3",
    "userId": "carol-user-id",
    "action": "document_created",
    "entityType": "document",
    "entityId": "doc-3",
    "timestamp": "2025-07-29T08:20:00.000Z",
    "details": {
      "title": "UI/UX Design Principles",
      "category": "Design"
    }
  },
  {
    "id": "act-4",
    "userId": "d0721b90-db82-4367-8909-74344287aece",
    "action": "user_followed",
    "entityType": "user",
    "entityId": "alice-user-id",
    "timestamp": "2025-07-28T12:00:00.000Z",
    "details": {
      "targetUserName": "Alice Johnson"
    }
  },
  {
    "id": "act-5",
    "userId": "alice-user-id",
    "action": "document_created",
    "entityType": "document",
    "entityId": "doc-4",
    "timestamp": "2025-07-26T16:45:00.000Z",
    "details": {
      "title": "Node.js Best Practices",
      "category": "Programming"
    }
  }
]
EOF

echo "Sample data populated successfully!"
echo "- Users: 4 users with diverse profiles"
echo "- Documents: 6 documents across different categories"
echo "- Interactions: 8 interactions (likes, bookmarks, follows)"
echo "- Activities: 5 recent activities"
echo
echo "You can now run the enhanced API tests with meaningful data."
