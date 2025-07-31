import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  let connection;
  
  try {
    console.log('👤 Creating test user...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connected');

    // Hash password
    const hashedPassword = await bcrypt.hash('user123', 12);
    
    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['user@growtogather.com']
    );

    if (existing.length > 0) {
      console.log('⚠️  Test user already exists!');
      console.log('📧 Email: user@growtogather.com');
      console.log('🔑 Password: user123');
      return;
    }

    // Insert test user
    const [result] = await connection.execute(`
      INSERT INTO users (
        username, full_name, email, password, role, 
        is_active, is_verified, profile_completed,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'testuser',
      'Test User', 
      'user@growtogather.com',
      hashedPassword,
      'user',
      1,
      1,
      1
    ]);

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: user@growtogather.com');
    console.log('🔑 Password: user123');
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

createTestUser();
