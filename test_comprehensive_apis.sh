#!/bin/bash

BASE_URL="http://localhost:3000"
SESSION_COOKIE=""

# Function to extract session cookie
authenticate() {
    LOGIN_RESPONSE=$(curl -s -i -X POST \
        -H "Content-Type: application/json" \
        -d '{ "email": "testuser2@example.com", "password": "password123" }' \
        "$BASE_URL/api/auth/login")
    SESSION_COOKIE=$(echo "$LOGIN_RESPONSE" | grep -o 'Set-Cookie: [^;]*' | sed 's/Set-Cookie: //')
    echo "Authenticated with session: ${SESSION_COOKIE:0:50}"
}

test_api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    echo "\nTesting $method $endpoint"

    RESPONSE=$(curl -s -X "$method" \
        -H "Content-Type: application/json" \
        -H "Cookie: $SESSION_COOKIE" \
        -d "$data" \
        "$BASE_URL$endpoint")

    echo "Response: $RESPONSE"
}

main() {
    echo "=== Starting Comprehensive API Test Suite ==="
    authenticate

    # Test document retrieval
    test_api "GET" "/api/documents/doc-1" ""

    # Test liking a document
    test_api "POST" "/api/interactions/like" '{"documentId": "doc-1"}'

    # Test bookmarking a document
    test_api "POST" "/api/interactions/bookmark" '{"documentId": "doc-1"}'

    # Test following a user
    test_api "POST" "/api/interactions/follow" '{"targetUserId": "bob-user-id"}'

    # Test unauthenticated feed access
    echo "\nTesting unauthenticated feed access"
    curl -s "$BASE_URL/api/feed"

    echo "\n=== API Test Suite Completed ==="
}

main

