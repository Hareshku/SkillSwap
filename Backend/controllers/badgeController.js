import { Badge, UserBadge, User } from '../models/index.js';
import { Op } from 'sequelize';

// Get all available badges
export const getAllBadges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const whereClause = { is_active: true };

    // Apply filters
    if (req.query.type) {
      whereClause.badge_type = req.query.type;
    }
    if (req.query.rarity) {
      whereClause.rarity = req.query.rarity;
    }

    const { count, rows: badges } = await Badge.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['rarity', 'ASC'], ['points_value', 'DESC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Badges retrieved successfully',
      data: {
        badges,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges'
    });
  }
};

// Get user's badges
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userBadges = await UserBadge.findAll({
      where: { user_id: userId },
      include: [{
        model: Badge,
        as: 'badge',
        where: { is_active: true }
      }],
      order: [['earned_at', 'DESC']]
    });

    // Calculate total points
    const totalPoints = userBadges.reduce((sum, userBadge) => {
      return sum + (userBadge.badge?.points_value || 0);
    }, 0);

    // Group badges by type
    const badgesByType = userBadges.reduce((acc, userBadge) => {
      const type = userBadge.badge.badge_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(userBadge);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'User badges retrieved successfully',
      data: {
        userBadges,
        badgesByType,
        totalPoints,
        badgeCount: userBadges.length
      }
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user badges'
    });
  }
};

// Get user's badge progress
export const getUserBadgeProgress = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all available badges
    const allBadges = await Badge.findAll({
      where: { is_active: true },
      order: [['badge_type', 'ASC'], ['rarity', 'ASC']]
    });

    // Get user's earned badges
    const earnedBadges = await UserBadge.findAll({
      where: { user_id: userId },
      include: [{
        model: Badge,
        as: 'badge'
      }]
    });

    const earnedBadgeIds = earnedBadges.map(ub => ub.badge_id);

    // Calculate progress for each badge type
    const progressByType = {};
    allBadges.forEach(badge => {
      const type = badge.badge_type;
      if (!progressByType[type]) {
        progressByType[type] = {
          total: 0,
          earned: 0,
          badges: []
        };
      }
      progressByType[type].total++;
      if (earnedBadgeIds.includes(badge.id)) {
        progressByType[type].earned++;
      }
      progressByType[type].badges.push({
        ...badge.toJSON(),
        isEarned: earnedBadgeIds.includes(badge.id),
        earnedAt: earnedBadges.find(ub => ub.badge_id === badge.id)?.earned_at || null
      });
    });

    res.status(200).json({
      success: true,
      message: 'Badge progress retrieved successfully',
      data: {
        progressByType,
        totalBadges: allBadges.length,
        earnedBadges: earnedBadges.length,
        completionPercentage: Math.round((earnedBadges.length / allBadges.length) * 100)
      }
    });
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badge progress'
    });
  }
};

// Toggle badge display on profile
export const toggleBadgeDisplay = async (req, res) => {
  try {
    const { userId, badgeId } = req.params;

    // Check if the requesting user is the owner or admin
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own badge display settings'
      });
    }

    const userBadge = await UserBadge.findOne({
      where: {
        user_id: userId,
        badge_id: badgeId
      }
    });

    if (!userBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found for this user'
      });
    }

    // Toggle display status
    userBadge.is_displayed = !userBadge.is_displayed;
    await userBadge.save();

    res.status(200).json({
      success: true,
      message: `Badge display ${userBadge.is_displayed ? 'enabled' : 'disabled'}`,
      data: {
        badgeId: userBadge.badge_id,
        isDisplayed: userBadge.is_displayed
      }
    });
  } catch (error) {
    console.error('Error toggling badge display:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update badge display setting'
    });
  }
};
