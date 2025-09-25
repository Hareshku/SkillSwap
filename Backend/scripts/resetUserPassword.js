import { User } from '../models/index.js';

const resetPassword = async () => {
  try {
    const email = 'hareesh7737@gmail.com';
    const newPassword = 'testpassword123';
    
    console.log(`Resetting password for: ${email}`);
    
    const user = await User.findOne({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Update password - this will trigger the beforeUpdate hook to hash it
    await user.update({ password: newPassword });
    
    console.log('✅ Password updated successfully');
    console.log(`New password: ${newPassword}`);
    
    // Test the new password
    const updatedUser = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });
    
    const isValid = await updatedUser.comparePassword(newPassword);
    console.log(`Password test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
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