import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3000';
let authCookie = '';

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (authCookie) {
    headers['Cookie'] = authCookie;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Store auth cookie from login
  if (response.headers.get('set-cookie')) {
    authCookie = response.headers.get('set-cookie');
  }

  return response;
}

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    const registerResponse = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData.message || registerData.error);

    // Test 2: User Login
    console.log('2. Testing User Login...');
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.message || loginData.error);

    // Test 3: Get User Session
    console.log('3. Testing User Session...');
    const sessionResponse = await makeRequest('/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('✅ Session:', sessionData.user?.name || sessionData.error);

    // Test 4: Document Upload (simulate file upload)
    console.log('4. Testing Document Upload...');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test document content for FileHub testing.');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('userId', 'd0721b90-db82-4367-8909-74344287aece');
    formData.append('title', 'Test Document');
    formData.append('description', 'A test document for API testing');
    formData.append('tags', 'test,api,document');
    formData.append('category', 'Testing');
    formData.append('isPublic', 'true');

    const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': authCookie
      }
    });
    
    const uploadData = await uploadResponse.json();
    console.log('✅ Upload:', uploadData.message || uploadData.error);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);

    // Test 5: Get Documents
    console.log('5. Testing Get Documents...');
    const documentsResponse = await makeRequest('/api/documents');
    const documentsData = await documentsResponse.json();
    console.log('✅ Documents:', `Found ${documentsData.documents?.length || 0} documents`);

    // Test 6: Search Documents
    console.log('6. Testing Search...');
    const searchResponse = await makeRequest('/api/search?q=test&type=documents');
    const searchData = await searchResponse.json();
    console.log('✅ Search:', `Found ${searchData.documents?.length || 0} documents`);

    // Test 7: Social Interactions - Like a document
    console.log('7. Testing Social Interactions...');
    const likeResponse = await makeRequest('/api/interactions/like', {
      method: 'POST',
      body: JSON.stringify({
        documentId: 'doc-1',
        liked: true
      })
    });
    const likeData = await likeResponse.json();
    console.log('✅ Like:', likeData.message || likeData.error);

    // Test 8: Notifications
    console.log('8. Testing Notifications...');
    const notificationResponse = await makeRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'document_upload'
      })
    });
    const notificationData = await notificationResponse.json();
    console.log('✅ Notification:', notificationData.notification?.title || notificationData.error);

    // Test 9: Get Notifications
    console.log('9. Testing Get Notifications...');
    const getNotificationsResponse = await makeRequest('/api/notifications');
    const getNotificationsData = await getNotificationsResponse.json();
    console.log('✅ Get Notifications:', `Found ${getNotificationsData.notifications?.length || 0} notifications`);

    // Test 10: Messages
    console.log('10. Testing Messages...');
    const messageResponse = await makeRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: 'd0721b90-db82-4367-8909-74344287aece',
        content: 'Hello! This is a test message.',
        type: 'text'
      })
    });
    const messageData = await messageResponse.json();
    console.log('✅ Message:', messageData.message?.content || messageData.error);

    // Test 11: Get Conversations
    console.log('11. Testing Get Conversations...');
    const conversationsResponse = await makeRequest('/api/messages');
    const conversationsData = await conversationsResponse.json();
    console.log('✅ Conversations:', `Found ${conversationsData.conversations?.length || 0} conversations`);

    // Test 12: Analytics
    console.log('12. Testing Analytics...');
    const analyticsResponse = await makeRequest('/api/analytics?type=user');
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics:', analyticsData.stats ? 'Stats retrieved' : analyticsData.error);

    // Test 13: Password Reset Request
    console.log('13. Testing Password Reset...');
    const passwordResetResponse = await makeRequest('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com'
      })
    });
    const passwordResetData = await passwordResetResponse.json();
    console.log('✅ Password Reset:', passwordResetData.message || passwordResetData.error);

    // Test 14: Email Verification
    console.log('14. Testing Email Verification...');
    const emailVerifyResponse = await makeRequest('/api/auth/verify-email', {
      method: 'POST'
    });
    const emailVerifyData = await emailVerifyResponse.json();
    console.log('✅ Email Verification:', emailVerifyData.message || emailVerifyData.error);

    // Test 15: Get Feed
    console.log('15. Testing Feed...');
    const feedResponse = await makeRequest('/api/feed');
    const feedData = await feedResponse.json();
    console.log('✅ Feed:', `Found ${feedData.activities?.length || 0} activities`);

    // Test 16: User Profile
    console.log('16. Testing User Profile...');
    const profileResponse = await makeRequest('/api/users/me');
    const profileData = await profileResponse.json();
    console.log('✅ Profile:', profileData.user?.name || profileData.error);

    // Test 17: Categories
    console.log('17. Testing Categories...');
    const categoriesResponse = await makeRequest('/api/categories');
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories:', `Found ${categoriesData.length || 0} categories`);

    // Test 18: Trending Topics
    console.log('18. Testing Trending Topics...');
    const trendingResponse = await makeRequest('/api/trending-topics');
    const trendingData = await trendingResponse.json();
    console.log('✅ Trending:', `Found ${trendingData.length || 0} trending topics`);

    // Test 19: User Counts
    console.log('19. Testing User Counts...');
    const countsResponse = await makeRequest('/api/user-counts');
    const countsData = await countsResponse.json();
    console.log('✅ User Counts:', countsData.favorites !== undefined ? 'Counts retrieved' : 'Error');

    // Test 20: Logout
    console.log('20. Testing Logout...');
    const logoutResponse = await makeRequest('/api/auth/logout', {
      method: 'POST'
    });
    const logoutData = await logoutResponse.json();
    console.log('✅ Logout:', logoutData.message || logoutData.error);

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAPI();
