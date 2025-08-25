import sequelize from './config/database.js';

const fixPostsStatusEnum = async () => {
  try {
    console.log('=== Fixing Posts Status ENUM ===');

    // Check current ENUM values
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'posts' 
      AND COLUMN_NAME = 'status' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    console.log('Current status ENUM values:', results[0]?.COLUMN_TYPE);

    // Update the ENUM to include all required values
    await sequelize.query(`
      ALTER TABLE posts 
      MODIFY COLUMN status ENUM('active', 'paused', 'completed', 'archived', 'removed') 
      DEFAULT 'active'
    `);

    console.log('✅ Updated status ENUM to include all values');

    // Now fix the inconsistent post
    await sequelize.query(`
      UPDATE posts 
      SET status = 'removed' 
      WHERE (removed_at IS NOT NULL OR removed_by IS NOT NULL OR removed_reason IS NOT NULL) 
      AND status != 'removed'
    `);

    console.log('✅ Fixed inconsistent posts - set status to removed for posts with removal data');

    // Verify the fix
    const [verifyResults] = await sequelize.query(`
      SELECT id, title, status, removed_at, removed_by, removed_reason 
      FROM posts 
      WHERE removed_at IS NOT NULL OR removed_by IS NOT NULL OR removed_reason IS NOT NULL
    `);

    console.log('\n=== Posts with removal data after fix ===');
    verifyResults.forEach(post => {
      console.log(`Post ID: ${post.id}, Title: ${post.title}, Status: ${post.status}`);
    });

    console.log('\n=== Fix Complete ===');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing posts status ENUM:', error);
    process.exit(1);
  }
};

fixPostsStatusEnum();