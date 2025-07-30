#!/bin/bash

BASE_URL="http://localhost:3000"
SESSION_COOKIE=""

echo "=== Testing Authentication Fixes ==="

# Login to get session
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -i -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "testuser2@example.com", "password": "password123"}' \
    "$BASE_URL/api/auth/login")

SESSION_COOKIE=$(echo "$LOGIN_RESPONSE" | grep -o 'Set-Cookie: [^;]*' | sed 's/Set-Cookie: //')
echo "Session: ${SESSION_COOKIE:0:50}..."

# Test status API with documentId
echo -e "\n2. Testing status API with documentId..."
STATUS_RESPONSE=$(curl -s -H "Cookie: $SESSION_COOKIE" \
    "$BASE_URL/api/interactions/status?documentId=doc-1")
echo "Status API Response: $STATUS_RESPONSE"

# Test like API
echo -e "\n3. Testing like API..."
LIKE_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: $SESSION_COOKIE" \
    -d '{"documentId": "doc-1"}' \
    "$BASE_URL/api/interactions/like")
echo "Like API Response: $LIKE_RESPONSE"

# Test bookmark API
echo -e "\n4. Testing bookmark API..."
BOOKMARK_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: $SESSION_COOKIE" \
    -d '{"documentId": "doc-1"}' \
    "$BASE_URL/api/interactions/bookmark")
echo "Bookmark API Response: $BOOKMARK_RESPONSE"

# Test document API
echo -e "\n5. Testing document API..."
DOC_RESPONSE=$(curl -s -H "Cookie: $SESSION_COOKIE" \
    "$BASE_URL/api/documents/doc-1")
echo "Document API Response: ${DOC_RESPONSE:0:100}..."

echo -e "\n=== Authentication Test Complete ==="
