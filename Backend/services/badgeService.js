import { Badge, UserBadge, User, Post, Meeting, Review, Feedback } from '../models/index.js';
import { Op } from 'sequelize';

class BadgeService {

  /**
   * Check and award badges for a user based on their activities
   * @param {number} userId - The user ID to check badges for
   */
  static async checkAndAwardBadges(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get all active badges
      const allBadges = await Badge.findAll({
        where: { is_active: true }
      });

      // Get user's current badges
      const userBadges = await UserBadge.findAll({
        where: { user_id: userId }
      });
      const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

      const newlyEarnedBadges = [];

      // Check each badge criteria
      for (const badge of allBadges) {
        // Skip if user already has this badge
        if (earnedBadgeIds.includes(badge.id)) {
          continue;
        }

        const hasEarned = await this.checkBadgeCriteria(userId, badge);
        if (hasEarned) {
          // Award the badge
          await UserBadge.create({
            user_id: userId,
            badge_id: badge.id,
            earned_at: new Date()
          });
          newlyEarnedBadges.push(badge);
        }
      }

      return newlyEarnedBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      throw error;
    }
  }

  /**
   * Check if user meets criteria for a specific badge
   * @param {number} userId - User ID
   * @param {Object} badge - Badge object with criteria
   */
  static async checkBadgeCriteria(userId, badge) {
    const { criteria } = badge;

    switch (criteria.type) {
      case 'teach_skills_successfully':
        return await this.checkTeachSkillsSuccessfully(userId, criteria.target);

      case 'complete_learning_sessions':
        return await this.checkCompleteLearningSession(userId, criteria.target);

      case 'maintain_high_rating':
        return await this.checkMaintainHighRating(userId, criteria.target_rating, criteria.minimum_reviews);

      case 'give_helpful_feedback':
        return await this.checkGiveHelpfulFeedback(userId, criteria.target);

      case 'teach_and_learn_skills':
        return await this.checkTeachAndLearnSkills(userId, criteria.teach_target, criteria.learn_target);

      case 'earn_all_other_badges':
        return await this.checkEarnAllOtherBadges(userId, criteria.required_badges);

      default:
        return false;
    }
  }

  /**
   * Check if user has taught required number of skills successfully
   */
  static async checkTeachSkillsSuccessfully(userId, target) {
    // Count completed meetings where user was the organizer (teacher)
    const completedTeachingSessions = await Meeting.count({
      where: {
        organizer_id: userId,
        status: 'completed'
      }
    });

    return completedTeachingSessions >= target;
  }

  /**
   * Check if user has completed required learning sessions
   */
  static async checkCompleteLearningSession(userId, target) {
    // Count completed meetings where user was the participant (learner)
    const completedLearningSessions = await Meeting.count({
      where: {
        participant_id: userId,
        status: 'completed'
      }
    });

    return completedLearningSessions >= target;
  }

  /**
   * Check if user maintains high rating across minimum reviews
   */
  static async checkMaintainHighRating(userId, targetRating, minimumReviews) {
    // Get all reviews for this user as a reviewee (being reviewed)
    const reviews = await Review.findAll({
      where: {
        reviewee_id: userId
      },
      attributes: ['rating']
    });

    if (reviews.length < minimumReviews) {
      return false;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return averageRating >= targetRating;
  }

  /**
   * Check if user has given required helpful feedback
   */
  static async checkGiveHelpfulFeedback(userId, target) {
    // Count feedback given by user with positive ratings
    const helpfulFeedbackCount = await Feedback.count({
      where: {
        giver_id: userId,
        rating: {
          [Op.gte]: 4 // Assuming 4+ rating is considered helpful
        }
      }
    });

    return helpfulFeedbackCount >= target;
  }

  /**
   * Check if user has both taught and learned required skills
   */
  static async checkTeachAndLearnSkills(userId, teachTarget, learnTarget) {
    // Count teaching sessions (as organizer)
    const teachingSessions = await Meeting.count({
      where: {
        organizer_id: userId,
        status: 'completed'
      }
    });

    // Count learning sessions (as participant)
    const learningSessions = await Meeting.count({
      where: {
        participant_id: userId,
        status: 'completed'
      }
    });

    return teachingSessions >= teachTarget && learningSessions >= learnTarget;
  }

  /**
   * Check if user has earned all other required badges
   */
  static async checkEarnAllOtherBadges(userId, requiredBadgeNames) {
    // Get badge IDs for required badge names
    const requiredBadges = await Badge.findAll({
      where: {
        name: {
          [Op.in]: requiredBadgeNames
        }
      },
      attributes: ['id']
    });

    const requiredBadgeIds = requiredBadges.map(b => b.id);

    // Check if user has all required badges
    const userBadges = await UserBadge.findAll({
      where: {
        user_id: userId,
        badge_id: {
          [Op.in]: requiredBadgeIds
        }
      }
    });

    return userBadges.length === requiredBadgeIds.length;
  }

  /**
   * Get user's badge progress for all badges
   */
  static async getUserBadgeProgress(userId) {
    const allBadges = await Badge.findAll({
      where: { is_active: true }
    });

    const userBadges = await UserBadge.findAll({
      where: { user_id: userId }
    });
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

    const progress = [];

    for (const badge of allBadges) {
      const isEarned = earnedBadgeIds.includes(badge.id);
      let progressPercentage = 0;
      let currentProgress = 0;
      let targetProgress = 0;

      if (!isEarned) {
        // Calculate progress towards earning this badge
        const progressData = await this.calculateBadgeProgress(userId, badge);
        progressPercentage = progressData.percentage;
        currentProgress = progressData.current;
        targetProgress = progressData.target;
      } else {
        progressPercentage = 100;
      }

      progress.push({
        badge,
        isEarned,
        progressPercentage,
        currentProgress,
        targetProgress,
        earnedAt: isEarned ? userBadges.find(ub => ub.badge_id === badge.id).earned_at : null
      });
    }

    return progress;
  }

  /**
   * Calculate progress towards earning a specific badge
   */
  static async calculateBadgeProgress(userId, badge) {
    const { criteria } = badge;
    let current = 0;
    let target = 0;

    switch (criteria.type) {
      case 'teach_skills_successfully':
        target = criteria.target;
        current = await Meeting.count({
          where: { organizer_id: userId, status: 'completed' }
        });
        break;

      case 'complete_learning_sessions':
        target = criteria.target;
        current = await Meeting.count({
          where: { participant_id: userId, status: 'completed' }
        });
        break;

      case 'maintain_high_rating':
        target = criteria.minimum_reviews;
        const reviews = await Review.findAll({
          where: { reviewee_id: userId },
          attributes: ['rating']
        });
        current = reviews.length;
        break;

      case 'give_helpful_feedback':
        target = criteria.target;
        current = await Feedback.count({
          where: { giver_id: userId, rating: { [Op.gte]: 4 } }
        });
        break;

      case 'teach_and_learn_skills':
        target = criteria.teach_target + criteria.learn_target;
        const teachCount = await Meeting.count({
          where: { organizer_id: userId, status: 'completed' }
        });
        const learnCount = await Meeting.count({
          where: { participant_id: userId, status: 'completed' }
        });
        current = Math.min(teachCount, criteria.teach_target) + Math.min(learnCount, criteria.learn_target);
        break;

      case 'earn_all_other_badges':
        target = criteria.required_badges.length;
        const requiredBadges = await Badge.findAll({
          where: { name: { [Op.in]: criteria.required_badges } }
        });
        const userBadges = await UserBadge.count({
          where: {
            user_id: userId,
            badge_id: { [Op.in]: requiredBadges.map(b => b.id) }
          }
        });
        current = userBadges;
        break;

      default:
        target = 1;
        current = 0;
    }

    const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

    return { current, target, percentage };
  }
}

export default BadgeService;