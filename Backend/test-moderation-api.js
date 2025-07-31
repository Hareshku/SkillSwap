import axios from 'axios';

const testModerationAPI = async () => {
  try {
    // First, login to get a fresh token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login/admin', {
      email: 'admin@growtogather.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test getting posts
    console.log('\n📋 Getting posts...');
    const postsResponse = await axios.get('http://localhost:3001/api/admin/posts?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!postsResponse.data.success) {
      console.error('❌ Failed to get posts:', postsResponse.data.message);
      return;
    }

    const posts = postsResponse.data.data.posts;
    console.log(`✅ Retrieved ${posts.length} posts`);

    if (posts.length === 0) {
      console.log('No posts available for testing');
      return;
    }

    // Find a post that's not already removed
    const testPost = posts.find(post => !post.removed_by);
    if (!testPost) {
      console.log('No active posts available for testing');
      return;
    }

    console.log(`\n🧪 Testing moderation on post: "${testPost.title}"`);

    // Test removing the post
    console.log('   Testing post removal...');
    const removeResponse = await axios.put(`http://localhost:3001/api/admin/posts/${testPost.id}/moderate`, {
      action: 'remove',
      reason: 'Test removal via API'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (removeResponse.data.success) {
      console.log('   ✅ Post removed successfully');
      console.log('   Response:', removeResponse.data);
    } else {
      console.log('   ❌ Post removal failed:', removeResponse.data.message);
    }

    // Test restoring the post
    console.log('   Testing post restoration...');
    const restoreResponse = await axios.put(`http://localhost:3001/api/admin/posts/${testPost.id}/moderate`, {
      action: 'approve',
      reason: 'Test restoration via API'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (restoreResponse.data.success) {
      console.log('   ✅ Post restored successfully');
      console.log('   Response:', restoreResponse.data);
    } else {
      console.log('   ❌ Post restoration failed:', restoreResponse.data.message);
    }

    console.log('\n🎉 Moderation API test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testModerationAPI();
