import { User } from '../models/index.js';

const listUsers = async () => {
  try {
    console.log('Listing all users...');
    
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'is_active', 'created_at']
    });
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      console.log(`\nFound ${users.length} users:`);
      users.forEach(user => {
        console.log({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at
        });
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

listUsers().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Failed:', error);
  process.exit(1);
});