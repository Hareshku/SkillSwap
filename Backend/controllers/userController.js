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
    console.log('Update profile request for user:', userId);
    console.log('Request body:', req.body);

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
      console.log('User not found:', userId);
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

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Add profile picture if uploaded
    if (req.file) {
      updateData.profile_picture = `/uploads/${req.file.filename}`;
    }

    console.log('Updating user with data:', updateData);
    await user.update(updateData);
    console.log('User basic info updated successfully');

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      console.log('Processing skills:', skills);

      // Remove existing user skills
      await UserSkill.destroy({ where: { user_id: userId } });

      // Add new skills
      if (skills.length > 0) {
        const skillPromises = skills.map(async (skill) => {
          try {
            console.log('Processing skill:', skill);

            // Validate skill data
            if (!skill.skill_name || typeof skill.skill_name !== 'string') {
              console.warn('Invalid skill name:', skill);
              return null;
            }

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
              console.log('Created new skill:', skillRecord.name);
            }

            // Create user-skill relationship
            const userSkill = await UserSkill.create({
              user_id: userId,
              skill_id: skillRecord.id,
              proficiency_level: skill.proficiency_level || 'beginner',
              can_teach: skill.skill_type === 'teach',
              wants_to_learn: skill.skill_type === 'learn'
            });

            console.log('Created user-skill relationship:', userSkill.id);
            return userSkill;
          } catch (skillError) {
            console.error('Error processing skill:', skill, skillError);
            return null;
          }
        });

        const results = await Promise.all(skillPromises);
        const successfulSkills = results.filter(result => result !== null);
        console.log(`Successfully processed ${successfulSkills.length} out of ${skills.length} skills`);
      }
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

    console.log('Profile updated successfully for user:', userId);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Get post recommendations for user based on their skills
export const getPostRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's skills with their types
    const userWithSkills = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          as: 'skills',
          through: {
            attributes: ['can_teach', 'wants_to_learn']
          }
        }
      ]
    });

    if (!userWithSkills || !userWithSkills.skills || userWithSkills.skills.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Add skills to your profile to get post recommendations'
      });
    }

    // Extract skill names based on user's learning interests and teaching abilities
    const skillsToLearn = userWithSkills.skills
      .filter(skill => skill.UserSkill.wants_to_learn)
      .map(skill => skill.name);

    const skillsToTeach = userWithSkills.skills
      .filter(skill => skill.UserSkill.can_teach)
      .map(skill => skill.name);

    console.log('=== RECOMMENDATION DEBUG ===');
    console.log('User ID:', userId);
    console.log('User with skills:', JSON.stringify(userWithSkills?.skills, null, 2));
    console.log('User skills to learn:', skillsToLearn);
    console.log('User skills to teach:', skillsToTeach);

    // Build where conditions for skill matching
    const whereConditions = {
      user_id: { [Op.ne]: userId }, // Exclude user's own posts
      status: 'active',
      is_approved: true
    };

    // Add skill matching conditions if user has skills
    if (skillsToLearn.length > 0 || skillsToTeach.length > 0) {
      const orConditions = [];

      // Posts teaching skills the user wants to learn
      if (skillsToLearn.length > 0) {
        skillsToLearn.forEach(skill => {
          console.log(`Looking for posts teaching: "${skill}"`);
          // Try different approaches for JSON array matching
          orConditions.push({
            skills_to_teach: {
              [Op.contains]: [skill]
            }
          });
          // Also try case-insensitive matching
          orConditions.push({
            skills_to_teach: {
              [Op.iLike]: `%"${skill}"%`
            }
          });
        });
      }

      // Posts wanting to learn skills the user can teach
      if (skillsToTeach.length > 0) {
        skillsToTeach.forEach(skill => {
          console.log(`Looking for posts wanting to learn: "${skill}"`);
          orConditions.push({
            skills_to_learn: {
              [Op.contains]: [skill]
            }
          });
          // Also try case-insensitive matching
          orConditions.push({
            skills_to_learn: {
              [Op.iLike]: `%"${skill}"%`
            }
          });
        });
      }

      if (orConditions.length > 0) {
        whereConditions[Op.or] = orConditions;
      }
    }

    console.log('Where conditions:', JSON.stringify(whereConditions, null, 2));

    // First, let's get all posts to see what's available
    const allPosts = await Post.findAll({
      where: {
        user_id: { [Op.ne]: userId },
        status: 'active',
        is_approved: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'profile_picture', 'profession']
        }
      ]
    });

    console.log('All available posts:', allPosts.length);
    allPosts.forEach(post => {
      console.log(`Post ${post.id} by ${post.author?.full_name}: skills_to_teach=${JSON.stringify(post.skills_to_teach)}, skills_to_learn=${JSON.stringify(post.skills_to_learn)}`);
    });

    // Find posts that match user's interests
    const recommendedPosts = await Post.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'profile_picture', 'profession']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log('Recommended posts found:', recommendedPosts.length);
    recommendedPosts.forEach(post => {
      console.log(`Recommended post ${post.id}: ${post.title} by ${post.author?.full_name}`);
    });

    // If no posts found with database query, try manual matching as fallback
    let finalRecommendations = recommendedPosts;

    if (recommendedPosts.length === 0 && (skillsToLearn.length > 0 || skillsToTeach.length > 0)) {
      console.log('No posts found with database query, trying manual matching...');

      const manualMatches = allPosts.filter(post => {
        // Check if post teaches skills user wants to learn
        const teachesWantedSkills = skillsToLearn.some(skill =>
          post.skills_to_teach &&
          Array.isArray(post.skills_to_teach) &&
          post.skills_to_teach.some(teachSkill =>
            teachSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(teachSkill.toLowerCase())
          )
        );

        // Check if post wants to learn skills user can teach
        const wantsSkillsUserTeaches = skillsToTeach.some(skill =>
          post.skills_to_learn &&
          Array.isArray(post.skills_to_learn) &&
          post.skills_to_learn.some(learnSkill =>
            learnSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(learnSkill.toLowerCase())
          )
        );

        return teachesWantedSkills || wantsSkillsUserTeaches;
      });

      console.log('Manual matches found:', manualMatches.length);
      manualMatches.forEach(post => {
        console.log(`Manual match ${post.id}: ${post.title} by ${post.author?.full_name}`);
      });

      finalRecommendations = manualMatches.slice(0, 10);
    }

    res.json({
      success: true,
      data: finalRecommendations
    });
  } catch (error) {
    console.error('Get post recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post recommendations'
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
