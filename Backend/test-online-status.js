import { User } from './models/index.js';

const testOnlineStatus = async () => {
  try {
    console.log('Testing online status...');

    // Get all users and their online status
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'username', 'is_online', 'last_seen'],
      limit: 10
    });

    console.log('Current users and their online status:');
    users.forEach(user => {
      console.log(`${user.full_name || user.username}: online=${user.is_online}, last_seen=${user.last_seen}`);
    });

    // Set first user as online for testing
    if (users.length > 0) {
      const testUser = users[0];
      await testUser.update({
        is_online: true,
        last_seen: new Date()
      });
      console.log(`\nSet ${testUser.full_name || testUser.username} as online for testing`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error testing online status:', error);
    process.exit(1);
  }
};

testOnlineStatus();