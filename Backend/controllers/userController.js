import { User, Post, Skill, Badge, UserSkill } from '../models/index.js';
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
          as: 'skills',
          through: {
            attributes: ['proficiency_level', 'can_teach', 'wants_to_learn', 'years_of_experience']
          }
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

  let {
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
    skills,
    username
  } = req.body;

  // Parse skills if it's a string (from FormData)
  if (typeof skills === 'string') {
    try {
      skills = JSON.parse(skills);
    } catch (error) {
      console.error('Error parsing skills JSON:', error);
      skills = [];
    }
  }

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
      username,
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

    // Check for username uniqueness if username is being updated
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username: username,
          id: { [Op.ne]: userId }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Remove undefined values and handle empty strings for ENUM fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
      // Handle empty strings for ENUM fields that should be null
      if (key === 'degree_level' || key === 'profession') {
        if (updateData[key] === '' || updateData[key] === null) {
          updateData[key] = null;
        }
      }
      // Handle empty strings for URL fields
      if (key === 'linkedin_url' || key === 'github_url' || key === 'portfolio_url') {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      }
    });

    // Add profile picture if uploaded (from file upload or form data)
    if (req.file) {
      updateData.profile_picture = `/uploads/${req.file.filename}`;
    } else if (req.files && req.files.profile_picture) {
      updateData.profile_picture = `/uploads/${req.files.profile_picture[0].filename}`;
    }

    console.log('Updating user with data:', updateData);
    try {
      await user.update(updateData);
      console.log('User basic info updated successfully');
    } catch (userUpdateError) {
      console.error('Error updating user basic info:', userUpdateError);
      throw new Error(`Failed to update user profile: ${userUpdateError.message}`);
    }

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      console.log('Processing skills:', skills);
      
      try {
        // Remove existing user skills
        const deletedCount = await UserSkill.destroy({ where: { user_id: userId } });
        console.log(`Deleted ${deletedCount} existing user skills`);

        // Add new skills
        if (skills.length > 0) {
          const skillPromises = skills.map(async (skill) => {
            try {
              console.log('Processing skill:', skill);

              // Validate skill data
              if (!skill.skill_name || typeof skill.skill_name !== 'string' || skill.skill_name.trim() === '') {
                console.warn('Invalid skill name:', skill);
                return null;
              }

              const cleanSkillName = skill.skill_name.trim();
              const skillType = skill.skill_type || 'learn';
              const proficiencyLevel = skill.proficiency_level || 'beginner';

              // Validate proficiency level
              if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(proficiencyLevel)) {
                console.warn('Invalid proficiency level, defaulting to beginner:', proficiencyLevel);
              }

              // First, find or create the skill in the skills table
              let skillRecord = await Skill.findOne({ 
                where: { name: cleanSkillName }
              });

              if (!skillRecord) {
                // Create new skill if it doesn't exist
                skillRecord = await Skill.create({
                  name: cleanSkillName,
                  category: skillType === 'teach' ? 'teaching' : 'learning',
                  is_approved: true,
                  created_by: userId
                });
                console.log('Created new skill:', skillRecord.name);
              }

              // Create user-skill relationship
              const userSkillData = {
                user_id: userId,
                skill_id: skillRecord.id,
                proficiency_level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(proficiencyLevel) ? proficiencyLevel : 'beginner',
                can_teach: skillType === 'teach',
                wants_to_learn: skillType === 'learn'
              };

              const userSkill = await UserSkill.create(userSkillData);
              console.log('Created user-skill relationship:', userSkill.id);
              return userSkill;
            } catch (skillError) {
              console.error('Error processing individual skill:', skill, skillError);
              return null;
            }
          });

          const results = await Promise.allSettled(skillPromises);
          const successfulSkills = results.filter(result => result.status === 'fulfilled' && result.value !== null);
          console.log(`Successfully processed ${successfulSkills.length} out of ${skills.length} skills`);
          
          // Log any failed skills
          const failedSkills = results.filter(result => result.status === 'rejected' || result.value === null);
          if (failedSkills.length > 0) {
            console.warn('Failed to process some skills:', failedSkills);
          }
        }
      } catch (skillsError) {
        console.error('Error processing skills:', skillsError);
        throw new Error(`Failed to update skills: ${skillsError.message}`);
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

    // Get user with password included
    const user = await User.findByPk(userId, {
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

    // Update password - let the model's beforeUpdate hook handle hashing
    await user.update({ password: newPassword });

    res.json({
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
