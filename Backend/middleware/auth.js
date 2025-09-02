import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = verifyToken(token);

    // Get user from database to ensure they still exist and are active
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user info to request object
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    // Update user activity (set online and update last_seen)
    try {
      await user.update({
        is_online: true,
        last_seen: new Date()
      }, { silent: true }); // silent: true prevents triggering hooks
    } catch (activityError) {
      // Don't fail the request if activity update fails
      console.error('Error updating user activity:', activityError);
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user is admin or accessing their own data
export const requireAdminOrOwner = (req, res, next) => {
  const targetUserId = parseInt(req.params.userId || req.params.id);

  if (req.userRole === 'admin' || req.userId === targetUserId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

export default {
  authenticateToken,
  requireAdmin,
  requireAdminOrOwner,
  optionalAuth
};
