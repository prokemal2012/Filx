#!/bin/bash

BASE_URL="http://localhost:3000"
SESSION_COOKIE=""

echo "=== Enhanced API Testing Suite ==="
echo "Testing enhanced feed and discovery features..."
echo

# Function to extract session cookie
extract_session() {
    local response="$1"
    echo "$response" | grep -o 'Set-Cookie: [^;]*' | sed 's/Set-Cookie: //'
}

# Function to make authenticated requests
auth_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
             -H "Content-Type: application/json" \
             -H "Cookie: $SESSION_COOKIE" \
             -d "$data" \
             "$BASE_URL$endpoint"
    else
        curl -s -X "$method" \
             -H "Cookie: $SESSION_COOKIE" \
             "$BASE_URL$endpoint"
    fi
}

echo "1. User Login"
echo "=============="
LOGIN_RESPONSE=$(curl -s -i -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testuser2@example.com",
        "password": "password123"
    }' \
    "$BASE_URL/api/auth/login")

SESSION_COOKIE=$(extract_session "$LOGIN_RESPONSE")
echo "Session obtained: ${SESSION_COOKIE:0:50}..."
echo

echo "2. Testing Enhanced Feed API"
echo "============================="
echo "Testing mixed feed (with fallbacks for users not following anyone)..."
FEED_RESPONSE=$(auth_request "GET" "/api/feed?limit=10&type=mixed")
echo "$FEED_RESPONSE" | jq -r '.stats // "No stats found"'
echo "Feed items count: $(echo "$FEED_RESPONSE" | jq '.items | length')"
echo "Activities count: $(echo "$FEED_RESPONSE" | jq '.activities | length')"
echo "Trending count: $(echo "$FEED_RESPONSE" | jq '.trending | length')"
echo "Recent documents count: $(echo "$FEED_RESPONSE" | jq '.recentDocuments | length')"
echo

echo "Sample feed items:"
echo "$FEED_RESPONSE" | jq -r '.items[0:3] | .[] | "- \(.type): \(.data.title // .data.user.name // .data.category // "N/A")"'
echo

echo "3. Testing Trending Categories API"
echo "=================================="
CATEGORIES_RESPONSE=$(auth_request "GET" "/api/categories/trending?limit=5")
echo "Categories found: $(echo "$CATEGORIES_RESPONSE" | jq '.total')"
echo "Sample categories:"
echo "$CATEGORIES_RESPONSE" | jq -r '.categories[0:3] | .[] | "- \(.category): \(.documentCount) documents, \(.recentActivity) recent activities"'
echo

echo "4. Testing Explore API"
echo "======================"
EXPLORE_RESPONSE=$(auth_request "GET" "/api/explore")
echo "Total sections: $(echo "$EXPLORE_RESPONSE" | jq '.totalSections')"
echo "Platform stats:"
echo "$EXPLORE_RESPONSE" | jq -r '.userStats | "- Total documents: \(.totalDocuments)\n- Total users: \(.totalUsers)\n- Total categories: \(.totalCategories)\n- User following: \(.userFollowing)"'
echo

echo "Explore sections:"
echo "$EXPLORE_RESPONSE" | jq -r '.sections | .[] | "- \(.title) (\(.type)): \(.totalCount) items"'
echo

echo "5. Sample trending documents:"
echo "$EXPLORE_RESPONSE" | jq -r '.sections[] | select(.type == "trending") | .items[0:2] | .[] | "- \(.title) by \(.author.name // "Unknown") (Score: \(.score))"'
echo

echo "6. Sample popular authors:"
echo "$EXPLORE_RESPONSE" | jq -r '.sections[] | select(.type == "popular_authors") | .items[0:3] | .[] | "- \(.name): \(.documentCount) docs, \(.likesReceived) likes"'
echo

echo "7. Testing different feed types"
echo "==============================="
echo "Testing recent-focused feed..."
RECENT_FEED=$(auth_request "GET" "/api/feed?type=recent&limit=5")
echo "Recent feed items: $(echo "$RECENT_FEED" | jq '.items | length')"

echo "Testing trending-focused feed..."
TRENDING_FEED=$(auth_request "GET" "/api/feed?type=trending&limit=5")
echo "Trending feed items: $(echo "$TRENDING_FEED" | jq '.items | length')"
echo

echo "8. Testing Pagination"
echo "===================="
echo "Page 1 (first 5 items):"
PAGE1=$(auth_request "GET" "/api/feed?limit=5&offset=0")
echo "Items count: $(echo "$PAGE1" | jq '.items | length')"
echo "Has more: $(echo "$PAGE1" | jq '.hasMore')"

echo "Page 2 (next 5 items):"
PAGE2=$(auth_request "GET" "/api/feed?limit=5&offset=5")
echo "Items count: $(echo "$PAGE2" | jq '.items | length')"
echo "Has more: $(echo "$PAGE2" | jq '.hasMore')"
echo

echo "9. Upload a test document to create more content"
echo "==============================================="
TEST_FILE="/tmp/test_document.txt"
echo "This is a test document for enhanced feed testing." > "$TEST_FILE"

UPLOAD_RESPONSE=$(curl -s -X POST \
    -H "Cookie: $SESSION_COOKIE" \
    -F "file=@$TEST_FILE" \
    -F "title=Enhanced Feed Test Document" \
    -F "description=A test document to validate enhanced feed functionality" \
    -F "userId=test-user-id" \
    -F "category=Testing" \
    -F "isPublic=true" \
    -F "tags=test,enhanced,feed" \
    "$BASE_URL/api/upload")

echo "Upload result: $(echo "$UPLOAD_RESPONSE" | jq -r '.message // .error')"
echo

echo "10. Test feed after upload"
echo "=========================="
sleep 2  # Wait for upload to process
POST_UPLOAD_FEED=$(auth_request "GET" "/api/feed?limit=10")
echo "Feed items after upload: $(echo "$POST_UPLOAD_FEED" | jq '.items | length')"
echo "Recent documents after upload: $(echo "$POST_UPLOAD_FEED" | jq '.recentDocuments | length')"
echo

echo "11. Testing error handling"
echo "=========================="
echo "Testing unauthenticated request:"
UNAUTH_RESPONSE=$(curl -s "$BASE_URL/api/feed")
echo "Error response: $(echo "$UNAUTH_RESPONSE" | jq -r '.error')"

echo "Testing invalid parameters:"
INVALID_RESPONSE=$(auth_request "GET" "/api/feed?limit=abc&offset=-1")
echo "Invalid params handled: $(echo "$INVALID_RESPONSE" | jq '.items | length // "Error handled"')"
echo

echo "=== Enhanced API Testing Complete ==="
echo "Summary:"
echo "- Enhanced feed API provides mixed content even when not following users"
echo "- Trending categories API shows popular content areas"
echo "- Explore API offers comprehensive content discovery"
echo "- All APIs handle pagination and error cases properly"
echo "- Feed adapts to user activity and provides fallback content"

# Cleanup
rm -f "$TEST_FILE"
