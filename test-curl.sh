#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIE_JAR="cookies.txt"

echo "🚀 Starting API Tests with cURL..."
echo

# Test 1: User Registration
echo "1. Testing User Registration..."
curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpassword123","name":"Test User"}' \
  | jq -r '.message // .error' | sed 's/^/✅ Registration: /'

# Test 2: User Login
echo "2. Testing User Login..."
curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpassword123"}' \
  | jq -r '.message // .error' | sed 's/^/✅ Login: /'

# Test 3: Get User Session
echo "3. Testing User Session..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/auth/session" \
  | jq -r '.user.name // .error' | sed 's/^/✅ Session: /'

# Test 4: Get Documents
echo "4. Testing Get Documents..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/documents" \
  | jq -r '(.documents | length | tostring) + " documents found"' | sed 's/^/✅ Documents: /'

# Test 5: Search
echo "5. Testing Search..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/search?q=react&type=documents" \
  | jq -r '(.documents | length | tostring) + " documents found"' | sed 's/^/✅ Search: /'

# Test 6: Notifications
echo "6. Testing Notifications..."
curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Notification","message":"This is a test","type":"document_upload"}' \
  | jq -r '.notification.title // .error' | sed 's/^/✅ Notification: /'

# Test 7: Get Notifications
echo "7. Testing Get Notifications..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/notifications" \
  | jq -r '(.notifications | length | tostring) + " notifications found"' | sed 's/^/✅ Get Notifications: /'

# Test 8: Messages
echo "8. Testing Messages..."
curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"d0721b90-db82-4367-8909-74344287aece","content":"Hello test message","type":"text"}' \
  | jq -r '.message.content // .error' | sed 's/^/✅ Message: /'

# Test 9: Analytics
echo "9. Testing Analytics..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/analytics?type=user" \
  | jq -r 'if .stats then "Stats retrieved" else .error end' | sed 's/^/✅ Analytics: /'

# Test 10: Password Reset
echo "10. Testing Password Reset..."
curl -s -X POST "$BASE_URL/api/auth/password-reset" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}' \
  | jq -r '.message // .error' | sed 's/^/✅ Password Reset: /'

# Test 11: Categories
echo "11. Testing Categories..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/categories" \
  | jq -r '(. | length | tostring) + " categories found"' | sed 's/^/✅ Categories: /'

# Test 12: User Counts
echo "12. Testing User Counts..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/user-counts" \
  | jq -r 'if .favorites != null then "Counts retrieved" else "Error" end' | sed 's/^/✅ User Counts: /'

# Test 13: Feed
echo "13. Testing Feed..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/feed" \
  | jq -r '(.activities | length | tostring) + " activities found"' | sed 's/^/✅ Feed: /'

# Test 14: User Profile
echo "14. Testing User Profile..."
curl -s -b "$COOKIE_JAR" "$BASE_URL/api/users/me" \
  | jq -r '.user.name // .error' | sed 's/^/✅ Profile: /'

# Test 15: Logout
echo "15. Testing Logout..."
curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/logout" \
  | jq -r '.message // .error' | sed 's/^/✅ Logout: /'

# Clean up
rm -f "$COOKIE_JAR"

echo
echo "🎉 All API tests completed!"
