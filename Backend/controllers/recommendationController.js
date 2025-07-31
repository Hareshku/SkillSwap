import Post from '../models/Post.js';
import User from '../models/User.js';
import RecommendationTracking from '../models/RecommendationTracking.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Enhanced recommendation system that matches users based on complementary skills
 * User A wants to learn Java -> User B teaches Java = Perfect Match
 */

// Helper function to normalize skills for better matching
const normalizeSkill = (skill) => {
  return skill.toLowerCase().trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Helper function to calculate skill similarity score
const calculateSkillSimilarity = (skill1, skill2) => {
  const normalized1 = normalizeSkill(skill1);
  const normalized2 = normalizeSkill(skill2);
  
  // Exact match
  if (normalized1 === normalized2) return 1.0;
  
  // Partial match (contains)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.8;
  }
  
  // Check for common programming language variations
  const languageVariations = {
    'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
    'python': ['py', 'django', 'flask', 'fastapi'],
    'java': ['spring', 'springboot', 'hibernate'],
    'csharp': ['c#', '.net', 'dotnet', 'asp.net'],
    'cpp': ['c++', 'cplusplus'],
    'typescript': ['ts'],
    'database': ['sql', 'mysql', 'postgresql', 'mongodb'],
    'frontend': ['html', 'css', 'ui', 'ux'],
    'backend': ['api', 'server', 'microservices']
  };
  
  for (const [base, variations] of Object.entries(languageVariations)) {
    if ((normalized1.includes(base) || variations.some(v => normalized1.includes(v))) &&
        (normalized2.includes(base) || variations.some(v => normalized2.includes(v)))) {
      return 0.6;
    }
  }
  
  return 0.0;
};

// Helper function to calculate experience level compatibility
const calculateExperienceLevelScore = (userLevel, postLevel) => {
  const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
  const userLevelNum = levels[userLevel] || 2;
  const postLevelNum = levels[postLevel] || 2;
  
  // Perfect match
  if (userLevelNum === postLevelNum) return 1.0;
  
  // One level difference
  if (Math.abs(userLevelNum - postLevelNum) === 1) return 0.8;
  
  // Two levels difference
  if (Math.abs(userLevelNum - postLevelNum) === 2) return 0.5;
  
  // More than two levels difference
  return 0.2;
};

// Helper function to calculate location compatibility
const calculateLocationScore = (userLocation, postLocation, userMeetingType, postMeetingType) => {
  // If both prefer online, location doesn't matter
  if (userMeetingType === 'online' && postMeetingType === 'online') return 1.0;
  
  // If one prefers online and other is flexible
  if ((userMeetingType === 'online' && postMeetingType === 'both') ||
      (userMeetingType === 'both' && postMeetingType === 'online')) return 0.9;
  
  // If both are flexible
  if (userMeetingType === 'both' && postMeetingType === 'both') return 0.8;
  
  // If offline meeting is involved, check location compatibility
  if (userLocation && postLocation) {
    const userLoc = normalizeSkill(userLocation);
    const postLoc = normalizeSkill(postLocation);
    
    if (userLoc === postLoc) return 1.0;
    if (userLoc.includes(postLoc) || postLoc.includes(userLoc)) return 0.7;
  }
  
  // Default score for offline preferences without location match
  return 0.3;
};

// Main recommendation function
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      limit = 10, 
      page = 1, 
      skillFilter = null,
      experienceLevel = null,
      meetingType = null 
    } = req.query;
    
    // Get current user's information
    const currentUser = await User.findByPk(userId, {
      attributes: ['id', 'country', 'state', 'profession', 'degree_level']
    });
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's own posts to understand their skills
    const userPosts = await Post.findAll({
      where: { 
        user_id: userId,
        status: 'active'
      },
      attributes: ['skills_to_teach', 'skills_to_learn', 'experience_level', 'preferred_meeting_type']
    });
    
    // Extract user's skills
    const userSkillsToLearn = new Set();
    const userSkillsToTeach = new Set();
    let userExperienceLevel = 'intermediate'; // default
    let userMeetingType = 'online'; // default
    
    userPosts.forEach(post => {
      post.skills_to_learn?.forEach(skill => userSkillsToLearn.add(normalizeSkill(skill)));
      post.skills_to_teach?.forEach(skill => userSkillsToTeach.add(normalizeSkill(skill)));
      userExperienceLevel = post.experience_level || userExperienceLevel;
      userMeetingType = post.preferred_meeting_type || userMeetingType;
    });
    
    // Build query conditions
    const whereConditions = {
      user_id: { [Op.ne]: userId }, // Exclude user's own posts
      status: 'active',
      removed_by: null // Exclude removed posts
    };
    
    // Add filters if provided
    if (skillFilter) {
      whereConditions[Op.or] = [
        { skills_to_teach: { [Op.like]: `%${skillFilter}%` } },
        { skills_to_learn: { [Op.like]: `%${skillFilter}%` } }
      ];
    }
    
    if (experienceLevel) {
      whereConditions.experience_level = experienceLevel;
    }
    
    if (meetingType) {
      whereConditions.preferred_meeting_type = meetingType;
    }
    
    // Get all potential posts
    const allPosts = await Post.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'email', 'profile_picture', 'bio', 'country', 'state', 'profession']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Calculate recommendation scores for each post
    const scoredRecommendations = allPosts.map(post => {
      let totalScore = 0;
      let matchReasons = [];
      let skillMatches = [];
      
      // 1. Skill Compatibility Score (60% weight)
      let skillScore = 0;
      let skillMatchCount = 0;
      
      // Check if user wants to learn what this post teaches
      if (userSkillsToLearn.size > 0 && post.skills_to_teach) {
        post.skills_to_teach.forEach(teachSkill => {
          const normalizedTeachSkill = normalizeSkill(teachSkill);
          userSkillsToLearn.forEach(learnSkill => {
            const similarity = calculateSkillSimilarity(learnSkill, normalizedTeachSkill);
            if (similarity > 0.5) {
              skillScore += similarity;
              skillMatchCount++;
              skillMatches.push({
                userWants: learnSkill,
                postOffers: teachSkill,
                similarity: similarity,
                type: 'learning_opportunity'
              });
            }
          });
        });
      }
      
      // Check if user can teach what this post wants to learn
      if (userSkillsToTeach.size > 0 && post.skills_to_learn) {
        post.skills_to_learn.forEach(learnSkill => {
          const normalizedLearnSkill = normalizeSkill(learnSkill);
          userSkillsToTeach.forEach(teachSkill => {
            const similarity = calculateSkillSimilarity(teachSkill, normalizedLearnSkill);
            if (similarity > 0.5) {
              skillScore += similarity;
              skillMatchCount++;
              skillMatches.push({
                userOffers: teachSkill,
                postWants: learnSkill,
                similarity: similarity,
                type: 'teaching_opportunity'
              });
            }
          });
        });
      }
      
      if (skillMatchCount > 0) {
        skillScore = (skillScore / skillMatchCount) * 0.6; // 60% weight
        matchReasons.push(`${skillMatchCount} skill match${skillMatchCount > 1 ? 'es' : ''} found`);
      }
      
      // 2. Experience Level Compatibility (20% weight)
      const experienceScore = calculateExperienceLevelScore(userExperienceLevel, post.experience_level) * 0.2;
      if (experienceScore > 0.6) {
        matchReasons.push('Compatible experience level');
      }
      
      // 3. Location/Meeting Type Compatibility (10% weight)
      const locationScore = calculateLocationScore(
        currentUser.state || currentUser.country,
        post.author?.state || post.author?.country,
        userMeetingType,
        post.preferred_meeting_type
      ) * 0.1;
      
      if (locationScore > 0.7) {
        matchReasons.push('Compatible meeting preferences');
      }
      
      // 4. Recency Bonus (10% weight)
      const daysSinceCreated = (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, (30 - daysSinceCreated) / 30) * 0.1; // Bonus for posts within 30 days
      
      totalScore = skillScore + experienceScore + locationScore + recencyScore;
      
      return {
        post: post.toJSON(),
        score: totalScore,
        matchReasons,
        skillMatches,
        breakdown: {
          skillScore: skillScore / 0.6, // Normalize to 0-1
          experienceScore: experienceScore / 0.2,
          locationScore: locationScore / 0.1,
          recencyScore: recencyScore / 0.1
        }
      };
    });
    
    // Sort by score and apply pagination
    const sortedRecommendations = scoredRecommendations
      .filter(rec => rec.score > 0.1) // Only include meaningful matches
      .sort((a, b) => b.score - a.score);
    
    const startIndex = (page - 1) * limit;
    const paginatedRecommendations = sortedRecommendations.slice(startIndex, startIndex + limit);
    
    res.json({
      success: true,
      data: {
        recommendations: paginatedRecommendations,
        pagination: {
          total: sortedRecommendations.length,
          page: parseInt(page),
          pages: Math.ceil(sortedRecommendations.length / limit),
          limit: parseInt(limit)
        },
        userSkillsAnalysis: {
          skillsToLearn: Array.from(userSkillsToLearn),
          skillsToTeach: Array.from(userSkillsToTeach),
          experienceLevel: userExperienceLevel,
          meetingType: userMeetingType
        }
      }
    });
    
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personalized recommendations'
    });
  }
};

// Get skill-based recommendations for a specific skill
export const getSkillBasedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.params;
    const { limit = 5 } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill parameter is required'
      });
    }

    const normalizedSkill = normalizeSkill(skill);

    // Find posts that teach this skill
    const teachingPosts = await Post.findAll({
      where: {
        user_id: { [Op.ne]: userId },
        status: 'active',
        removed_by: null,
        [Op.or]: [
          { skills_to_teach: { [Op.like]: `%${skill}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'email', 'profile_picture', 'bio']
        }
      ],
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    // Find posts that want to learn this skill (potential teaching opportunities)
    const learningPosts = await Post.findAll({
      where: {
        user_id: { [Op.ne]: userId },
        status: 'active',
        removed_by: null,
        [Op.or]: [
          { skills_to_learn: { [Op.like]: `%${skill}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'email', 'profile_picture', 'bio']
        }
      ],
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        skill: skill,
        learningOpportunities: teachingPosts,
        teachingOpportunities: learningPosts
      }
    });

  } catch (error) {
    console.error('Get skill-based recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill-based recommendations'
    });
  }
};

// Get trending skills and popular posts
export const getTrendingRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get most popular skills from recent posts
    const recentPosts = await Post.findAll({
      where: {
        status: 'active',
        removed_by: null,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      attributes: ['skills_to_teach', 'skills_to_learn', 'views_count', 'likes_count']
    });

    // Count skill frequencies
    const skillCounts = {};
    recentPosts.forEach(post => {
      [...(post.skills_to_teach || []), ...(post.skills_to_learn || [])].forEach(skill => {
        const normalizedSkill = normalizeSkill(skill);
        skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
      });
    });

    // Get top trending skills
    const trendingSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Get most popular posts (by views and likes)
    const popularPosts = await Post.findAll({
      where: {
        user_id: { [Op.ne]: userId },
        status: 'active',
        removed_by: null
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'email', 'profile_picture']
        }
      ],
      order: [
        ['views_count', 'DESC'],
        ['likes_count', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        trendingSkills,
        popularPosts
      }
    });

  } catch (error) {
    console.error('Get trending recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending recommendations'
    });
  }
};

// Track recommendation interaction (view, click, etc.)
export const trackRecommendationInteraction = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      postId,
      action,
      matchScore = null,
      skillMatches = null,
      recommendationType = 'personalized',
      positionInList = null,
      timeSpent = null,
      filtersApplied = null
    } = req.body;

    if (!postId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and action are required'
      });
    }

    // Update post views if it's a view action
    if (action === 'view') {
      await Post.increment('views_count', {
        where: { id: postId }
      });
    }

    // Track the interaction in our analytics table
    await RecommendationTracking.create({
      user_id: userId,
      recommended_post_id: postId,
      recommendation_type: recommendationType,
      action: action,
      match_score: matchScore,
      skill_matches: skillMatches,
      position_in_list: positionInList,
      time_spent: timeSpent,
      filters_applied: filtersApplied,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip || req.connection.remoteAddress,
      referrer: req.headers.referer
    });

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

// Get recommendation analytics for improving the algorithm
export const getRecommendationAnalytics = async (req, res) => {
  try {
    const { timeframe = '30d', action = null } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereConditions = {
      createdAt: {
        [Op.gte]: startDate
      }
    };

    if (action) {
      whereConditions.action = action;
    }

    // Get interaction counts by action
    const actionCounts = await RecommendationTracking.findAll({
      where: whereConditions,
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['action'],
      raw: true
    });

    // Get average match scores by action
    const avgScores = await RecommendationTracking.findAll({
      where: {
        ...whereConditions,
        match_score: { [Op.not]: null }
      },
      attributes: [
        'action',
        [sequelize.fn('AVG', sequelize.col('match_score')), 'avg_score'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['action'],
      raw: true
    });

    // Get successful connection rate
    const connectionStats = await RecommendationTracking.findAll({
      where: whereConditions,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_interactions'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN successful_connection = true THEN 1 ELSE 0 END')), 'successful_connections']
      ],
      raw: true
    });

    // Get most effective skill matches
    const skillMatchAnalysis = await RecommendationTracking.findAll({
      where: {
        ...whereConditions,
        skill_matches: { [Op.not]: null },
        action: 'contact' // Focus on contact actions as they indicate strong interest
      },
      attributes: ['skill_matches', 'match_score'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        timeframe,
        actionCounts,
        avgScores,
        connectionStats: connectionStats[0] || { total_interactions: 0, successful_connections: 0 },
        skillMatchAnalysis
      }
    });

  } catch (error) {
    console.error('Get recommendation analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendation analytics'
    });
  }
};

// Submit feedback for a recommendation
export const submitRecommendationFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, rating, comment } = req.body;

    if (!postId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find the most recent tracking record for this user and post
    const trackingRecord = await RecommendationTracking.findOne({
      where: {
        user_id: userId,
        recommended_post_id: postId
      },
      order: [['createdAt', 'DESC']]
    });

    if (trackingRecord) {
      // Update existing record with feedback
      await trackingRecord.update({
        feedback_rating: rating,
        feedback_comment: comment
      });
    } else {
      // Create new tracking record with feedback
      await RecommendationTracking.create({
        user_id: userId,
        recommended_post_id: postId,
        recommendation_type: 'personalized',
        action: 'feedback',
        feedback_rating: rating,
        feedback_comment: comment
      });
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Submit recommendation feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};
