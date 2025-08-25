import { Post } from './models/index.js';
import { Op } from 'sequelize';

// Fix posts that were marked as removed but still have active status
async function fixRemovedPosts() {
  try {
    console.log('Fixing posts that were removed but still have active status...');

    const result = await Post.update(
      { status: 'removed' },
      {
        where: {
          status: 'active',
          removed_at: { [Op.ne]: null }
        }
      }
    );

    console.log(`Fixed ${result[0]} posts that were marked as removed but had active status`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing removed posts:', error);
    process.exit(1);
  }
}

fixRemovedPosts();