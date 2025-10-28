import { Post, User, Skill, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import BadgeService from '../services/badgeService.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      title,
      description,
      skills_to_learn,
      skills_to_teach,
      post_type,
      experience_level,
      availability,
      preferred_meeting_type
    } = req.body;

    const post = await Post.create({
      user_id: userId,
      title,
      description,
      skills_to_learn: Array.isArray(skills_to_learn) ? skills_to_learn : [skills_to_learn],
      skills_to_teach: Array.isArray(skills_to_teach) ? skills_to_teach : [skills_to_teach],
      post_type: post_type || 'exchange',
      experience_level,
      availability,
      preferred_meeting_type: preferred_meeting_type || 'online',
      status: 'active',
      is_approved: true, // Auto-approve for testing
      approved_at: new Date()
    });

    // Fetch the created post with user details
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: createdPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Get all posts (for discover page)
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = (page - 1) * limit;
    const { skills, post_type, search } = req.query;

    // Search API called

    // Base conditions that always apply
    const baseConditions = {
      status: 'active',
      is_approved: true
    };

    let whereClause = { ...baseConditions };

    // Handle search functionality
    if (search && String(search).trim() !== '') {
      const searchTerm = String(search).trim();

      // Use simple OR logic for search across multiple fields
      whereClause = {
        ...baseConditions,
        [Op.or]: [
          // Search in title (case insensitive)
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('title')),
            'LIKE',
            `%${searchTerm.toLowerCase()}%`
          ),
          // Search in description (case insensitive)
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('description')),
            'LIKE',
            `%${searchTerm.toLowerCase()}%`
          ),
          // Search in skills_to_learn JSON array (case-insensitive)
          sequelize.where(
            sequelize.fn('JSON_SEARCH', sequelize.fn('LOWER', sequelize.col('skills_to_learn')), 'one', `%${searchTerm.toLowerCase()}%`),
            { [Op.ne]: null }
          ),
          // Search in skills_to_teach JSON array (case-insensitive)
          sequelize.where(
            sequelize.fn('JSON_SEARCH', sequelize.fn('LOWER', sequelize.col('skills_to_teach')), 'one', `%${searchTerm.toLowerCase()}%`),
            { [Op.ne]: null }
          )
        ]
      };
    }

    // Add post type filter if specified
    if (post_type && post_type !== 'all') {
      whereClause.post_type = post_type;
    }

    // Execute search query

    const posts = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password'] }
        }
      ],
      limit,
      offset,
      order: [
        // Online users first, then by creation date
        [{ model: User, as: 'author' }, 'is_online', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    // Search completed successfully

    res.json({
      success: true,
      data: posts.rows,
      pagination: {
        total: posts.count,
        page,
        pages: Math.ceil(posts.count / limit),
        limit
      }
    });
  } catch (error) {
    console.error('❌ Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's posts (current user)
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password'] }
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          total: posts.count,
          page,
          pages: Math.ceil(posts.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts'
    });
  }
};

// Get posts by specific user ID
export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: {
        user_id: userId,
        status: 'active' // Only show active posts
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password'] }
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: posts.rows,
      pagination: {
        total: posts.count,
        page,
        pages: Math.ceil(posts.count / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get posts by user ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts'
    });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      skills_to_learn,
      skills_to_teach,
      post_type,
      availability,
      preferred_meeting_type,
      status
    } = req.body;

    const post = await Post.findOne({
      where: { id: postId, user_id: userId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to edit this post'
      });
    }

    await post.update({
      title,
      description,
      skills_to_learn: Array.isArray(skills_to_learn) ? skills_to_learn : [skills_to_learn],
      skills_to_teach: Array.isArray(skills_to_teach) ? skills_to_teach : [skills_to_teach],
      post_type,
      availability,
      preferred_meeting_type,
      status
    });

    // Fetch updated post with user details
    const updatedPost = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findOne({
      where: { id: postId, user_id: userId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to delete this post'
      });
    }

    await post.destroy();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// Get recommended posts for user
export const getRecommendedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's skills
    const userSkills = await Skill.findAll({
      where: { user_id: userId },
      attributes: ['skill_name']
    });

    const skillNames = userSkills.map(skill => skill.skill_name);

    if (skillNames.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Add skills to your profile to get personalized recommendations'
      });
    }

    // Find posts that match user's skills
    const recommendedPosts = await Post.findAll({
      where: {
        user_id: { [Op.ne]: userId }, // Exclude user's own posts
        status: 'active',
        [Op.or]: [
          { skills_to_learn: { [Op.overlap]: skillNames } },
          { skills_to_teach: { [Op.overlap]: skillNames } }
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: recommendedPosts
    });
  } catch (error) {
    console.error('Get recommended posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended posts'
    });
  }
};
// Get search suggestions for skills
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = q.trim();

    // Get all active posts and do case-insensitive filtering in JavaScript
    // This is more reliable than trying to make MySQL JSON_SEARCH case-insensitive
    const posts = await Post.findAll({
      where: {
        status: 'active'
      },
      attributes: ['skills_to_teach', 'skills_to_learn']
    });

    // Extract and flatten all skills
    const allSkills = new Set();

    posts.forEach(post => {
      // Add skills from skills_to_teach
      if (post.skills_to_teach && Array.isArray(post.skills_to_teach)) {
        post.skills_to_teach.forEach(skill => {
          if (skill.toLowerCase().includes(searchTerm.toLowerCase())) {
            allSkills.add(skill);
          }
        });
      }

      // Add skills from skills_to_learn
      if (post.skills_to_learn && Array.isArray(post.skills_to_learn)) {
        post.skills_to_learn.forEach(skill => {
          if (skill.toLowerCase().includes(searchTerm.toLowerCase())) {
            allSkills.add(skill);
          }
        });
      }
    });

    // Convert to array and sort by relevance (exact matches first, then partial matches)
    const suggestions = Array.from(allSkills)
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // Exact matches first
        if (aLower === searchLower && bLower !== searchLower) return -1;
        if (bLower === searchLower && aLower !== searchLower) return 1;

        // Starts with search term
        if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
        if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1;

        // Alphabetical order
        return a.localeCompare(b);
      })
      .slice(0, 10); // Limit to 10 suggestions

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
};