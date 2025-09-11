import { Post, User, Skill, UserSkill, RecommendationTracking } from '../models/index.js';
import { Op } from 'sequelize';

// Get personalized post recommendations for a user
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // First, check if user has created any posts
    const userPosts = await Post.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      attributes: ['id', 'skills_to_teach', 'skills_to_learn']
    });

    if (userPosts.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          message: 'Create your first post to get personalized recommendations! Share what you can teach and what you want to learn.',
          pagination: {
            total: 0,
            page,
            pages: 0,
            limit
          }
        }
      });
    }

    // Extract all skills from user's posts
    let userTeachingSkills = [];
    let userLearningSkills = [];

    userPosts.forEach(post => {
      if (Array.isArray(post.skills_to_teach)) {
        userTeachingSkills = [...userTeachingSkills, ...post.skills_to_teach.map(skill => skill.toLowerCase())];
      }
      if (Array.isArray(post.skills_to_learn)) {
        userLearningSkills = [...userLearningSkills, ...post.skills_to_learn.map(skill => skill.toLowerCase())];
      }
    });

    // Remove duplicates
    userTeachingSkills = [...new Set(userTeachingSkills)];
    userLearningSkills = [...new Set(userLearningSkills)];



    if (userLearningSkills.length === 0 && userTeachingSkills.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          message: 'Add skills to your posts to get personalized recommendations!',
          pagination: {
            total: 0,
            page,
            pages: 0,
            limit
          }
        }
      });
    }

    // Build query conditions for matching posts
    // Since Op.overlap doesn't work well with case-insensitive matching,
    // we'll get all other posts and filter them manually
    const matchConditions = {
      user_id: { [Op.ne]: userId },
      status: 'active',
      is_approved: true
    };

    if (matchConditions.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          message: 'No matching posts found. Try adding more skills to your posts!',
          pagination: {
            total: 0,
            page,
            pages: 0,
            limit
          }
        }
      });
    }



    // Get all other posts and filter manually for case-insensitive matching
    const allOtherPosts = await Post.findAll({
      where: matchConditions,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'full_name', 'username', 'profile_picture', 'location', 'is_online', 'last_seen']
      }],
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC']
      ]
    });

    // Filter posts manually for case-insensitive skill matching
    const matchingPosts = allOtherPosts.filter(post => {
      const postSkillsToTeach = Array.isArray(post.skills_to_teach)
        ? post.skills_to_teach.map(skill => skill.toLowerCase())
        : [];
      const postSkillsToLearn = Array.isArray(post.skills_to_learn)
        ? post.skills_to_learn.map(skill => skill.toLowerCase())
        : [];

      // Check if this post teaches what user wants to learn
      const teachesWhatUserLearns = userLearningSkills.some(userLearningSkill =>
        postSkillsToTeach.some(postTeachingSkill =>
          postTeachingSkill.includes(userLearningSkill) || userLearningSkill.includes(postTeachingSkill)
        )
      );

      // Check if this post wants to learn what user can teach
      const learnsWhatUserTeaches = userTeachingSkills.some(userTeachingSkill =>
        postSkillsToLearn.some(postLearningSkill =>
          postLearningSkill.includes(userTeachingSkill) || userTeachingSkill.includes(postLearningSkill)
        )
      );

      return teachesWhatUserLearns || learnsWhatUserTeaches;
    });

    // Apply pagination to filtered results
    const total = matchingPosts.length;
    const paginatedPosts = matchingPosts.slice(offset, offset + limit);

    const recommendedPosts = {
      rows: paginatedPosts,
      count: total
    };



    // Calculate match scores and types for better ranking
    const postsWithScores = recommendedPosts.rows.map(post => {
      let matchScore = 0;
      let teachingMatches = [];
      let learningMatches = [];
      let matchType = '';

      const postSkillsToTeach = Array.isArray(post.skills_to_teach)
        ? post.skills_to_teach.map(skill => skill.toLowerCase())
        : [];
      const postSkillsToLearn = Array.isArray(post.skills_to_learn)
        ? post.skills_to_learn.map(skill => skill.toLowerCase())
        : [];

      // Check if this post teaches what user wants to learn
      userLearningSkills.forEach(userLearningSkill => {
        if (postSkillsToTeach.some(postTeachingSkill =>
          postTeachingSkill.includes(userLearningSkill) || userLearningSkill.includes(postTeachingSkill)
        )) {
          matchScore += 2; // Higher weight for teaching matches
          teachingMatches.push(userLearningSkill);
        }
      });

      // Check if this post wants to learn what user can teach
      userTeachingSkills.forEach(userTeachingSkill => {
        if (postSkillsToLearn.some(postLearningSkill =>
          postLearningSkill.includes(userTeachingSkill) || userTeachingSkill.includes(postLearningSkill)
        )) {
          matchScore += 1; // Lower weight for learning matches
          learningMatches.push(userTeachingSkill);
        }
      });

      // Determine match type
      if (teachingMatches.length > 0 && learningMatches.length > 0) {
        matchType = 'mutual'; // Perfect mutual exchange
        matchScore += 3; // Bonus for mutual exchange
      } else if (teachingMatches.length > 0) {
        matchType = 'teaching'; // They teach what you want to learn
      } else if (learningMatches.length > 0) {
        matchType = 'learning'; // They want to learn what you teach
      }

      return {
        ...post.toJSON(),
        matchScore,
        matchType,
        teachingMatches,
        learningMatches,
        totalMatches: teachingMatches.length + learningMatches.length
      };
    });

    // Sort by match score (highest first), then by creation date
    postsWithScores.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json({
      success: true,
      data: {
        posts: postsWithScores,
        userTeachingSkills,
        userLearningSkills,
        pagination: {
          total: recommendedPosts.count,
          page,
          pages: Math.ceil(recommendedPosts.count / limit),
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Track user interaction with recommended posts
export const trackRecommendationInteraction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, interactionType } = req.body;

    // Validate interaction type
    const validInteractions = ['view', 'click', 'contact', 'schedule', 'like', 'dismiss'];
    if (!validInteractions.includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interaction type'
      });
    }

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create or update tracking record
    const [tracking, created] = await RecommendationTracking.findOrCreate({
      where: {
        user_id: userId,
        recommended_post_id: postId
      },
      defaults: {
        interaction_type: interactionType,
        interaction_count: 1,
        first_interaction_at: new Date(),
        last_interaction_at: new Date()
      }
    });

    if (!created) {
      // Update existing tracking
      await tracking.update({
        interaction_type: interactionType,
        interaction_count: tracking.interaction_count + 1,
        last_interaction_at: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Track recommendation interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction'
    });
  }
};

// Get recommendation analytics for admin
export const getRecommendationAnalytics = async (req, res) => {
  try {
    // Get total recommendations served
    const totalRecommendations = await RecommendationTracking.count();

    // Get most popular recommended posts
    const popularPosts = await RecommendationTracking.findAll({
      attributes: [
        'recommended_post_id',
        [RecommendationTracking.sequelize.fn('COUNT', RecommendationTracking.sequelize.col('id')), 'interaction_count'],
        [RecommendationTracking.sequelize.fn('COUNT', RecommendationTracking.sequelize.literal('DISTINCT user_id')), 'unique_users']
      ],
      include: [{
        model: Post,
        as: 'post',
        attributes: ['id', 'title', 'skills_to_teach'],
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'username']
        }]
      }],
      group: ['recommended_post_id'],
      order: [[RecommendationTracking.sequelize.fn('COUNT', RecommendationTracking.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    // Get interaction type distribution
    const interactionTypes = await RecommendationTracking.findAll({
      attributes: [
        'interaction_type',
        [RecommendationTracking.sequelize.fn('COUNT', RecommendationTracking.sequelize.col('id')), 'count']
      ],
      group: ['interaction_type'],
      order: [[RecommendationTracking.sequelize.fn('COUNT', RecommendationTracking.sequelize.col('id')), 'DESC']]
    });

    res.json({
      success: true,
      data: {
        totalRecommendations,
        popularPosts,
        interactionTypes
      }
    });

  } catch (error) {
    console.error('Get recommendation analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

export default {
  getPersonalizedRecommendations,
  trackRecommendationInteraction,
  getRecommendationAnalytics
};