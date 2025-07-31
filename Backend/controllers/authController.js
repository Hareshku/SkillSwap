import { User } from '../models/index.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

// Register new user (Simple signup)
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Create verification token
    const verification_token = crypto.randomBytes(32).toString('hex');

    // Create new user with minimal information
    const user = await User.create({
      username,
      email,
      password,
      verification_token,
      is_verified: false,
      profile_completed: false
    });

    // Generate tokens
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      email: user.email 
    });

    // Update last login
    await user.update({ last_login: new Date() });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generic login function
const performLogin = async (email, password, requiredRole = null) => {
  // Find user by email
  const user = await User.findOne({
    where: { email },
    attributes: { include: ['password'] }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if account is active
  if (!user.is_active) {
    throw new Error('Account is deactivated. Please contact support.');
  }

  // Check role if specified
  if (requiredRole && user.role !== requiredRole) {
    throw new Error(`Access denied. This login is for ${requiredRole}s only.`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email
  });

  // Update last login
  await user.update({ last_login: new Date() });

  return {
    user: user.toJSON(),
    token,
    refreshToken
  };
};

// Login user (general login - supports both users and admins)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await performLogin(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user (role-specific for regular users)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await performLogin(email, password, 'user');

    res.status(200).json({
      success: true,
      message: 'User login successful',
      data: result
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'User login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login admin (role-specific for admins)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await performLogin(email, password, 'admin');

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: result
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Admin login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password', 'verification_token', 'reset_password_token'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByPk(req.userId, {
      attributes: { include: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Complete community registration (profile completion)
export const completeProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      full_name,
      bio,
      profession,
      degree_level,
      institute,
      state,
      country,
      timezone,
      linkedin_url,
      github_url,
      portfolio_url
    } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle profile picture upload
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = `/uploads/${req.file.filename}`;
    }

    // Update user profile
    const updateData = {
      full_name,
      bio,
      profession,
      degree_level,
      institute,
      state,
      country,
      timezone,
      linkedin_url,
      github_url,
      portfolio_url,
      profile_completed: true
    };

    // Add profile picture if uploaded
    if (profilePicturePath) {
      updateData.profile_picture = profilePicturePath;
    }

    await user.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout (client-side token removal, but we can track it)
export const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  register,
  login,
  getProfile,
  changePassword,
  logout
};
