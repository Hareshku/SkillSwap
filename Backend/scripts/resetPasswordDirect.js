import { User } from '../models/index.js';

const resetPassword = async () => {
  try {
    console.log('🔄 Resetting password directly in database...');
    
    const email = 'hareesh7737@gmail.com';
    const newPassword = 'testpassword123';
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`Found user: ${user.username} (${user.email})`);
    
    // Use the model's update method which will trigger the beforeUpdate hook
    await user.update({ password: newPassword });
    
    console.log('✅ Password reset successfully');
    
    // Test the password
    const updatedUser = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });
    
    const isValid = await updatedUser.comparePassword(newPassword);
    console.log(`Password validation test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    console.log('\nNow you can use the following credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

resetPassword().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Failed:', error);
  process.exit(1);
});