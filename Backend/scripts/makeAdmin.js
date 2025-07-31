import { User } from '../models/index.js';
import { sequelize } from '../config/database.js';

async function makeUserAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Update user to admin
    const [updatedRowsCount] = await User.update(
      { role: 'admin' },
      { where: { email: 'testuser456@example.com' } }
    );

    if (updatedRowsCount > 0) {
      console.log('User successfully updated to admin role!');
      
      // Verify the update
      const user = await User.findOne({ where: { email: 'testuser456@example.com' } });
      console.log('Updated user:', {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      });
    } else {
      console.log('No user found with that email.');
    }

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await sequelize.close();
  }
}

makeUserAdmin();
