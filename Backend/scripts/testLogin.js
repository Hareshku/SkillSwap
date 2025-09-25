import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

const testLogin = async () => {
  try {
    console.log('Testing login functionality...');
    
    // Get a user from database
    const testEmail = 'hareesh7737@gmail.com'; // First user in the list
    const testPassword = 'testpassword123'; // Updated test password
    
    console.log(`\nTesting login for: ${testEmail}`);
    
    // Find user
    const user = await User.findOne({
      where: { email: testEmail },
      attributes: { include: ['password'] }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Test password comparison
    console.log('\nTesting password comparison...');
    console.log('Password to test:', testPassword);
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    
    // Direct bcrypt comparison
    const directCompare = await bcrypt.compare(testPassword, user.password);
    console.log('Direct bcrypt.compare result:', directCompare);
    
    // User method comparison
    const userMethodCompare = await user.comparePassword(testPassword);
    console.log('User.comparePassword result:', userMethodCompare);
    
    if (directCompare && userMethodCompare) {
      console.log('✅ Password comparison working correctly');
    } else {
      console.log('❌ Password comparison failed');
      
      // Test with some common passwords
      const testPasswords = ['admin123', 'password', '123456', 'admin'];
      for (const pwd of testPasswords) {
        const testResult = await bcrypt.compare(pwd, user.password);
        console.log(`Testing '${pwd}': ${testResult}`);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testLogin().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});