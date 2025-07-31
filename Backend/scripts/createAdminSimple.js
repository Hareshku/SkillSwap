import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  let connection;
  
  try {
    console.log('🔧 Creating admin user...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connected');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Check if admin exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@growtogather.com']
    );

    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@growtogather.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Insert admin user
    const [result] = await connection.execute(`
      INSERT INTO users (
        username, full_name, email, password, role, 
        is_active, is_verified, profile_completed,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'admin',
      'System Administrator', 
      'admin@growtogather.com',
      hashedPassword,
      'admin',
      1,
      1,
      1
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@growtogather.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', result.insertId);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔄 Database connection closed');
    }
  }
};

createAdmin();
