import { Post, User } from './models/index.js';
import { Op } from 'sequelize';

const debugPostsStatus = async () => {
  try {
    console.log('=== Debugging Posts Status ===');

    // Get all posts with their status
    const allPosts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log('\n=== All Posts Status ===');
    allPosts.forEach(post => {
      console.log(`Post ID: ${post.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Author: ${post.author?.full_name || post.author?.username}`);
      console.log(`Status: ${post.status}`);
      console.log(`Removed At: ${post.removed_at}`);
      console.log(`Removed By: ${post.removed_by}`);
      console.log(`Removed Reason: ${post.removed_reason}`);
      console.log('---');
    });

    // Count posts by status
    const statusCounts = await Post.findAll({
      attributes: [
        'status',
        [Post.sequelize.fn('COUNT', Post.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    console.log('\n=== Posts Count by Status ===');
    statusCounts.forEach(item => {
      console.log(`${item.status}: ${item.dataValues.count}`);
    });

    // Check specifically for posts that should be removed
    const postsWithRemovalData = await Post.findAll({
      where: {
        [Op.or]: [
          { removed_at: { [Op.ne]: null } },
          { removed_by: { [Op.ne]: null } },
          { removed_reason: { [Op.ne]: null } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'username', 'email']
        }
      ]
    });

    console.log('\n=== Posts with Removal Data ===');
    postsWithRemovalData.forEach(post => {
      console.log(`Post ID: ${post.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Author: ${post.author?.full_name || post.author?.username}`);
      console.log(`Status: ${post.status}`);
      console.log(`Removed At: ${post.removed_at}`);
      console.log(`Removed By: ${post.removed_by}`);
      console.log(`Removed Reason: ${post.removed_reason}`);
      console.log('---');
    });

    // Find posts that have removal data but status is not 'removed'
    const inconsistentPosts = await Post.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { removed_at: { [Op.ne]: null } },
              { removed_by: { [Op.ne]: null } },
              { removed_reason: { [Op.ne]: null } }
            ]
          },
          { status: { [Op.ne]: 'removed' } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'username', 'email']
        }
      ]
    });

    console.log('\n=== Inconsistent Posts (have removal data but status is not removed) ===');
    if (inconsistentPosts.length === 0) {
      console.log('No inconsistent posts found.');
    } else {
      inconsistentPosts.forEach(post => {
        console.log(`Post ID: ${post.id}`);
        console.log(`Title: ${post.title}`);
        console.log(`Author: ${post.author?.full_name || post.author?.username}`);
        console.log(`Status: ${post.status} (should be 'removed')`);
        console.log(`Removed At: ${post.removed_at}`);
        console.log(`Removed By: ${post.removed_by}`);
        console.log(`Removed Reason: ${post.removed_reason}`);
        console.log('---');
      });

      // Fix inconsistent posts
      console.log('\n=== Fixing Inconsistent Posts ===');
      for (const post of inconsistentPosts) {
        await post.update({ status: 'removed' });
        console.log(`Fixed post ID ${post.id} - set status to 'removed'`);
      }
    }

    console.log('\n=== Debug Complete ===');
    process.exit(0);

  } catch (error) {
    console.error('Error debugging posts status:', error);
    process.exit(1);
  }
};

debugPostsStatus();