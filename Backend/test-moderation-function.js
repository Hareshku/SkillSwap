import { moderatePost } from './controllers/adminController.js';
import Post from './models/Post.js';
import User from './models/User.js';
import { sequelize } from './config/database.js';

const testModerationFunction = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Mock request and response objects
    const mockReq = {
      params: { postId: '4' },
      body: { action: 'remove', reason: 'Test removal from function' },
      user: { id: 9 } // Admin user ID
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response Status: ${code}`);
          console.log('Response Data:', JSON.stringify(data, null, 2));
          return data;
        }
      }),
      json: (data) => {
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return data;
      }
    };

    console.log('\n🧪 Testing moderatePost function...');
    console.log('Request params:', mockReq.params);
    console.log('Request body:', mockReq.body);
    console.log('Request user:', mockReq.user);

    // Call the function
    await moderatePost(mockReq, mockRes);

    console.log('\n✅ Function test completed!');

    // Verify the post was updated
    console.log('\n🔍 Checking post status in database...');
    const post = await Post.findByPk(4);
    if (post) {
      console.log('Post status after moderation:');
      console.log(`- ID: ${post.id}`);
      console.log(`- Title: ${post.title}`);
      console.log(`- Status: ${post.status}`);
      console.log(`- Removed by: ${post.removed_by}`);
      console.log(`- Removed at: ${post.removed_at}`);
      console.log(`- Removed reason: ${post.removed_reason}`);
    } else {
      console.log('❌ Post not found');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
};

testModerationFunction();
