import { User, sequelize, testConnection } from '../models/index.js';

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding default users...');

    // Test database connection first
    await testConnection();
    console.log('✅ Database connection successful');

    // Sync database to ensure tables exist
    await sequelize.sync();
    console.log('✅ Database synchronized');

    // Default users to create
    const defaultUsers = [
      {
        username: 'admin',
        full_name: 'System Administrator',
        email: 'admin@growtogather.com',
        password: 'admin123',
        role: 'admin',
        is_active: true,
        is_verified: true,
        profile_completed: true
      },
      {
        username: 'testuser',
        full_name: 'Test User',
        email: 'user@growtogather.com',
        password: 'user123',
        role: 'user',
        is_active: true,
        is_verified: true,
        profile_completed: true
      }
    ];

    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { email: userData.email } 
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }

      // Create user
      const user = await User.create(userData);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('');
    console.log('🎉 User seeding completed!');
    console.log('');
    console.log('🔐 Default Login Credentials:');
    console.log('');
    console.log('👨‍💼 ADMIN LOGIN:');
    console.log('   Email: admin@growtogather.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 USER LOGIN:');
    console.log('   Email: user@growtogather.com');
    console.log('   Password: user123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    console.log('🔄 Closing database connection...');
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(() => process.exit(0));
}

export default seedUsers;
