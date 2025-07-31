import { Post, User, Skill } from '../models/index.js';
import { Op } from 'sequelize';

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
      status: 'active'
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
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { skills, post_type, search } = req.query;

    let whereClause = {
      status: 'active'
    };

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { skills_to_learn: { [Op.contains]: [search] } },
        { skills_to_teach: { [Op.contains]: [search] } }
      ];
    }

    // Add post type filter
    if (post_type) {
      whereClause.post_type = post_type;
    }

    // Add skills filter
    if (skills) {
      const skillArray = skills.split(',');
      whereClause[Op.or] = [
        ...(whereClause[Op.or] || []),
        { skills_to_learn: { [Op.overlap]: skillArray } },
        { skills_to_teach: { [Op.overlap]: skillArray } }
      ];
    }

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
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Get user's posts
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
          as: 'user',
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

// Get single post
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
          include: [
            {
              model: Skill,
              as: 'skills'
            }
          ]
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
