import { User, sequelize, testConnection } from '../models/index.js';
import bcrypt from 'bcryptjs';

const createDefaultAdmin = async () => {
  try {
    console.log('🔧 Creating default admin user...');

    // Test database connection first
    await testConnection();
    console.log('✅ Database connection successful');

    // Default admin credentials
    const defaultAdmin = {
      username: 'admin',
      full_name: 'System Administrator',
      email: 'admin@growtogather.com',
      password: 'admin123',
      role: 'admin',
      is_active: true,
      is_verified: true,
      profile_completed: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: defaultAdmin.email } 
    });

    if (existingAdmin) {
      console.log('⚠️  Default admin user already exists');
      console.log('📧 Email:', defaultAdmin.email);
      console.log('🔑 Password: admin123');
      return;
    }

    // Create admin user
    const admin = await User.create(defaultAdmin);

    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email:', defaultAdmin.email);
    console.log('🔑 Password:', defaultAdmin.password);
    console.log('👤 Username:', defaultAdmin.username);
    console.log('🆔 User ID:', admin.id);
    console.log('');
    console.log('🚀 You can now login as admin using:');
    console.log('   Email: admin@growtogather.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultAdmin().then(() => process.exit(0));
}

export default createDefaultAdmin;
