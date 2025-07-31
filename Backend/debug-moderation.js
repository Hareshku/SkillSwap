import mysql from 'mysql2/promise';

const testModeration = async () => {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '@arti12@',
      database: 'GrowTogather'
    });

    console.log('Connected to MySQL database');

    // Test if the posts table has the new fields
    console.log('Checking posts table structure...');
    const [columns] = await connection.execute('DESCRIBE posts');
    console.log('Posts table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    // Test updating a post
    console.log('\nTesting post update...');
    const postId = 2;
    const adminId = 9;
    
    // First check if the post exists
    const [posts] = await connection.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      console.log('Post not found');
      return;
    }
    
    console.log('Post found:', posts[0].title);
    
    // Try to update the post (removal)
    const updateQuery = `
      UPDATE posts
      SET removed_reason = ?, removed_at = ?, removed_by = ?
      WHERE id = ?
    `;

    const [result] = await connection.execute(updateQuery, [
      'Test removal',
      new Date(),
      adminId,
      postId
    ]);
    
    console.log('Update result:', result);
    console.log('✅ Post moderation test successful!');

    await connection.end();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
};

testModeration();
