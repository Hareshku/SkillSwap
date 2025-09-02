import { Post, User } from './models/index.js';

const testPostsAPI = async () => {
  try {
    console.log('Testing posts API response...');

    // Simulate the getAllPosts query
    const posts = await Post.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password'] }
        }
      ],
      limit: 3,
      order: [['created_at', 'DESC']]
    });

    console.log('Posts with author data:');
    posts.forEach(post => {
      const author = post.author;
      console.log(`Post: ${post.title}`);
      console.log(`Author: ${author.full_name || author.username}`);
      console.log(`Online: ${author.is_online}`);
      console.log(`Last seen: ${author.last_seen}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error testing posts API:', error);
    process.exit(1);
  }
};

testPostsAPI();