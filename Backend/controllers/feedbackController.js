import { Feedback, User, Meeting, Post, sequelize } from '../models/index.js';
import BadgeService from '../services/badgeService.js';

// Create feedback
export const createFeedback = async (req, res) => {
  try {
    const giverId = req.user.id;
    const {
      receiver_id,
      meeting_id,
      post_id,
      rating,
      comment,
      feedback_type,
      skills_rated,
      is_anonymous = false,
      is_public = true
    } = req.body;

    // Validation
    if (!receiver_id || !rating || !feedback_type) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, rating, and feedback type are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (giverId === receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot give feedback to yourself'
      });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if meeting exists (if meeting_id provided)
    if (meeting_id) {
      const meeting = await Meeting.findByPk(meeting_id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Verify user was part of the meeting
      if (meeting.organizer_id !== giverId && meeting.participant_id !== giverId) {
        return res.status(403).json({
          success: false,
          message: 'You can only give feedback for meetings you participated in'
        });
      }
    }

    // Check if post exists (if post_id provided)
    if (post_id) {
      const post = await Post.findByPk(post_id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
    }

    // Check for duplicate feedback
    const existingFeedback = await Feedback.findOne({
      where: {
        giver_id: giverId,
        receiver_id,
        meeting_id: meeting_id || null
      }
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already given feedback for this interaction'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      giver_id: giverId,
      receiver_id,
      meeting_id,
      post_id,
      rating,
      comment,
      feedback_type,
      skills_rated,
      is_anonymous,
      is_public
    });

    // Check for new badges for the feedback giver
    try {
      const newBadges = await BadgeService.checkAndAwardBadges(giverId);
      if (newBadges.length > 0) {
        console.log(`🎉 ${newBadges.length} new badges awarded to user ${giverId} after giving feedback`);
      }
    } catch (badgeError) {
      console.error('Error checking badges after feedback creation:', badgeError);
      // Don't fail the feedback creation if badge checking fails
    }

    // Get feedback with user details
    const feedbackWithDetails = await Feedback.findByPk(feedback.id, {
      include: [
        {
          model: User,
          as: 'giver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: feedbackWithDetails
    });

  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feedback'
    });
  }
};

// Get feedback for a user (received)
export const getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { receiver_id: userId, is_public: true };

    if (type) {
      whereClause.feedback_type = type;
    }

    const { count, rows: feedback } = await Feedback.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'giver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// Get feedback given by a user
export const getFeedbackGiven = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: feedback } = await Feedback.findAndCountAll({
      where: { giver_id: userId },
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching given feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// Get feedback statistics for a user
export const getFeedbackStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get average ratings by type
    const stats = await Feedback.findAll({
      where: { receiver_id: userId, is_public: true },
      attributes: [
        'feedback_type',
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
      ],
      group: ['feedback_type']
    });

    // Get overall stats
    const overallStats = await Feedback.findOne({
      where: { receiver_id: userId, is_public: true },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'overall_average'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_feedback']
      ]
    });

    // Get rating distribution
    const ratingDistribution = await Feedback.findAll({
      where: { receiver_id: userId, is_public: true },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: {
        byType: stats,
        overall: overallStats,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics'
    });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;
    const { rating, comment, skills_rated, is_public } = req.body;

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns the feedback
    if (feedback.giver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own feedback'
      });
    }

    // Update feedback
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (skills_rated !== undefined) updateData.skills_rated = skills_rated;
    if (is_public !== undefined) updateData.is_public = is_public;

    await feedback.update(updateData);

    // Get updated feedback with details
    const updatedFeedback = await Feedback.findByPk(feedbackId, {
      include: [
        {
          model: User,
          as: 'giver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns the feedback
    if (feedback.giver_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own feedback'
      });
    }

    await feedback.destroy();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
};

// Mark feedback as helpful
export const markFeedbackHelpful = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.increment('helpful_count');

    res.status(200).json({
      success: true,
      message: 'Feedback marked as helpful',
      data: { helpful_count: feedback.helpful_count + 1 }
    });

  } catch (error) {
    console.error('Error marking feedback as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark feedback as helpful'
    });
  }
};