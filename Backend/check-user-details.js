import { User } from './models/index.js';
import bcrypt from 'bcryptjs';

const checkUserDetails = async () => {
  try {
    console.log('=== User Details ===');

    const user = await User.findOne({
      where: { email: 'john@gmail.com' }
    });

    if (user) {
      console.log('User found:', {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name
      });

      // Test common passwords
      const testPasswords = ['password123', '123456', 'password', 'john123'];

      for (const pwd of testPasswords) {
        const isMatch = await bcrypt.compare(pwd, user.password);
        console.log(`Password "${pwd}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
      }
    } else {
      console.log('User not found');
    }

    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUserDetails();