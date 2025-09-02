import { User } from '../models/index.js';
import { Op } from 'sequelize';

// Middleware to update user's last activity
export const updateUserActivity = async (req, res, next) => {
  try {
    if (req.userId) {
      // Update last_seen for authenticated users
      await User.update(
        {
          last_seen: new Date(),
          is_online: true
        },
        {
          where: { id: req.userId },
          silent: true // Don't trigger hooks
        }
      );
    }
    next();
  } catch (error) {
    // Don't fail the request if activity update fails
    console.error('Error updating user activity:', error);
    next();
  }
};

// Function to mark users as offline if they haven't been seen for a while
export const markInactiveUsersOffline = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    await User.update(
      { is_online: false },
      {
        where: {
          is_online: true,
          last_seen: {
            [Op.lt]: fiveMinutesAgo
          }
        },
        silent: true
      }
    );
  } catch (error) {
    console.error('Error marking inactive users offline:', error);
  }
};

export default { updateUserActivity, markInactiveUsersOffline };