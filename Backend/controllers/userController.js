import { User, Post, Skill, Badge, UserSkill } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Skill,
          as: 'skills'
        },
        {
          model: Badge,
          as: 'badges'
        },
        {
          model: Post,
          as: 'posts',
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      profession,
      degree_level,
      institute,
      state,
      country,
      timezone,
      skills
    } = req.body;

    // Update user basic info
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle profile picture upload
    const updateData = {
      full_name,
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      profession,
      degree_level,
      institute,
      state,
      country,
      timezone
    };

    // Add profile picture if uploaded
    if (req.file) {
      updateData.profile_picture = `/uploads/${req.file.filename}`;
    }

    await user.update(updateData);

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Remove existing user skills
      await UserSkill.destroy({ where: { user_id: userId } });

      // Add new skills
      const skillPromises = skills.map(async (skill) => {
        // First, find or create the skill in the skills table
        let skillRecord = await Skill.findOne({ where: { name: skill.skill_name } });

        if (!skillRecord) {
          // Create new skill if it doesn't exist
          skillRecord = await Skill.create({
            name: skill.skill_name,
            category: skill.skill_type || 'general', // Use skill_type as category
            is_approved: true,
            created_by: userId
          });
        }

        // Create user-skill relationship
        return UserSkill.create({
          user_id: userId,
          skill_id: skillRecord.id,
          proficiency_level: skill.proficiency_level || 'beginner',
          can_teach: skill.skill_type === 'teach',
          wants_to_learn: skill.skill_type === 'learn'
        });
      });

      await Promise.all(skillPromises);
    }

    // Fetch updated user with associations
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Skill,
          as: 'skills',
          through: {
            attributes: ['proficiency_level', 'can_teach', 'wants_to_learn', 'years_of_experience']
          }
        },
        {
          model: Badge,
          as: 'badges'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;

    await User.update(
      { profile_picture: profilePictureUrl },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profile_picture: profilePictureUrl }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await user.update({ password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Get user recommendations
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's skills
    const userSkills = await Skill.findAll({
      where: { user_id: userId },
      attributes: ['skill_name']
    });

    const skillNames = userSkills.map(skill => skill.skill_name);

    if (skillNames.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Add skills to your profile to get recommendations'
      });
    }

    // Find users with similar skills
    const recommendedUsers = await User.findAll({
      where: {
        id: { [Op.ne]: userId }, // Exclude current user
        is_active: true
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Skill,
          as: 'skills',
          where: {
            skill_name: { [Op.in]: skillNames }
          }
        }
      ],
      limit: 10
    });

    res.json({
      success: true,
      data: recommendedUsers
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query, skills, location, profession } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {
      is_active: true,
      id: { [Op.ne]: req.user.id } // Exclude current user
    };

    // Add search filters
    if (query) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${query}%` } },
        { bio: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (location) {
      whereClause[Op.or] = [
        ...(whereClause[Op.or] || []),
        { state: { [Op.iLike]: `%${location}%` } },
        { country: { [Op.iLike]: `%${location}%` } }
      ];
    }

    if (profession) {
      whereClause.profession = { [Op.iLike]: `%${profession}%` };
    }

    const includeClause = [
      {
        model: Skill,
        as: 'skills'
      }
    ];

    // Add skill filter
    if (skills) {
      const skillArray = skills.split(',');
      includeClause[0].where = {
        skill_name: { [Op.in]: skillArray }
      };
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      include: includeClause,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          total: users.count,
          page,
          pages: Math.ceil(users.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};
