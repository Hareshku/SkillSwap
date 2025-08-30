import { Review, User, Meeting } from '../models/index.js';
import { Op } from 'sequelize';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const {
      reviewee_id,
      meeting_id,
      rating,
      feedback,
      skills_exchanged,
      exchange_type,
      communication_rating,
      knowledge_rating,
      punctuality_rating,
      would_recommend
    } = req.body;

    // Validate that reviewer is not reviewing themselves
    if (reviewerId === parseInt(reviewee_id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review yourself'
      });
    }

    // Check if reviewee exists
    const reviewee = await User.findByPk(reviewee_id);
    if (!reviewee) {
      return res.status(404).json({
        success: false,
        message: 'User to review not found'
      });
    }

    // If meeting_id is provided, validate the meeting
    if (meeting_id) {
      const meeting = await Meeting.findByPk(meeting_id);
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Check if the reviewer was part of this meeting
      if (meeting.organizer_id !== reviewerId && meeting.participant_id !== reviewerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only review users from meetings you participated in'
        });
      }

      // Check if review already exists for this meeting
      const existingReview = await Review.findOne({
        where: {
          reviewer_id: reviewerId,
          reviewee_id: reviewee_id,
          meeting_id: meeting_id
        }
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this user for this meeting'
        });
      }
    }

    // Create the review
    const review = await Review.create({
      reviewer_id: reviewerId,
      reviewee_id,
      meeting_id,
      rating,
      feedback,
      skills_exchanged,
      exchange_type,
      communication_rating,
      knowledge_rating,
      punctuality_rating,
      would_recommend: would_recommend !== undefined ? would_recommend : true,
      is_public: true,
      is_verified: false
    });

    // Fetch the created review with associations
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'full_name', 'username', 'profile_picture']
        },
        {
          model: User,
          as: 'reviewee',
          attributes: ['id', 'full_name', 'username', 'profile_picture']
        },
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['id', 'title', 'meeting_date']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: createdReview
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reviews for a specific user
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get reviews for this user
    const reviews = await Review.findAndCountAll({
      where: {
        reviewee_id: userId,
        is_public: true
      },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'full_name', 'username', 'profile_picture']
        },
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['id', 'title', 'meeting_date']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Calculate average ratings
    const avgRatings = await Review.findOne({
      where: {
        reviewee_id: userId,
        is_public: true
      },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avg_rating'],
        [Review.sequelize.fn('AVG', Review.sequelize.col('communication_rating')), 'avg_communication'],
        [Review.sequelize.fn('AVG', Review.sequelize.col('knowledge_rating')), 'avg_knowledge'],
        [Review.sequelize.fn('AVG', Review.sequelize.col('punctuality_rating')), 'avg_punctuality'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'total_reviews']
      ]
    });

    // Calculate recommendation percentage
    const recommendationStats = await Review.findOne({
      where: {
        reviewee_id: userId,
        is_public: true
      },
      attributes: [
        [Review.sequelize.fn('COUNT', Review.sequelize.literal('CASE WHEN would_recommend = true THEN 1 END')), 'recommendations'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'total_reviews']
      ]
    });

    const stats = {
      avg_rating: parseFloat(avgRatings?.dataValues?.avg_rating || 0).toFixed(1),
      avg_communication: parseFloat(avgRatings?.dataValues?.avg_communication || 0).toFixed(1),
      avg_knowledge: parseFloat(avgRatings?.dataValues?.avg_knowledge || 0).toFixed(1),
      avg_punctuality: parseFloat(avgRatings?.dataValues?.avg_punctuality || 0).toFixed(1),
      total_reviews: parseInt(avgRatings?.dataValues?.total_reviews || 0),
      recommendation_percentage: recommendationStats?.dataValues?.total_reviews > 0
        ? Math.round((recommendationStats.dataValues.recommendations / recommendationStats.dataValues.total_reviews) * 100)
        : 0
    };

    res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        stats,
        pagination: {
          total: reviews.count,
          page,
          pages: Math.ceil(reviews.count / limit),
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reviews given by a user
export const getReviewsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: {
        reviewer_id: userId
      },
      include: [
        {
          model: User,
          as: 'reviewee',
          attributes: ['id', 'full_name', 'username', 'profile_picture']
        },
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['id', 'title', 'meeting_date']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.rows,
        pagination: {
          total: reviews.count,
          page,
          pages: Math.ceil(reviews.count / limit),
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get reviews by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const {
      rating,
      feedback,
      skills_exchanged,
      communication_rating,
      knowledge_rating,
      punctuality_rating,
      would_recommend
    } = req.body;

    // Find the review
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.reviewer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update the review
    await review.update({
      rating,
      feedback,
      skills_exchanged,
      communication_rating,
      knowledge_rating,
      punctuality_rating,
      would_recommend
    });

    // Fetch updated review with associations
    const updatedReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'full_name', 'username', 'profile_picture']
        },
        {
          model: User,
          as: 'reviewee',
          attributes: ['id', 'full_name', 'username', 'profile_picture']
        },
        {
          model: Meeting,
          as: 'meeting',
          attributes: ['id', 'title', 'meeting_date']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Find the review
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.reviewer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete the review
    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user rating statistics
export const getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all reviews for this user
    const reviews = await Review.findAll({
      where: {
        reviewee_id: userId,
        is_public: true
      },
      attributes: ['rating', 'communication_rating', 'knowledge_rating', 'punctuality_rating']
    });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
          },
          averageCommunicationRating: 0,
          averageKnowledgeRating: 0,
          averagePunctualityRating: 0
        }
      });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating breakdown
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      ratingBreakdown[review.rating]++;
    });

    // Calculate other average ratings
    const communicationRatings = reviews.filter(r => r.communication_rating).map(r => r.communication_rating);
    const knowledgeRatings = reviews.filter(r => r.knowledge_rating).map(r => r.knowledge_rating);
    const punctualityRatings = reviews.filter(r => r.punctuality_rating).map(r => r.punctuality_rating);

    const averageCommunicationRating = communicationRatings.length > 0
      ? communicationRatings.reduce((sum, rating) => sum + rating, 0) / communicationRatings.length
      : 0;

    const averageKnowledgeRating = knowledgeRatings.length > 0
      ? knowledgeRatings.reduce((sum, rating) => sum + rating, 0) / knowledgeRatings.length
      : 0;

    const averagePunctualityRating = punctualityRatings.length > 0
      ? punctualityRatings.reduce((sum, rating) => sum + rating, 0) / punctualityRatings.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
        ratingBreakdown,
        averageCommunicationRating: Math.round(averageCommunicationRating * 10) / 10,
        averageKnowledgeRating: Math.round(averageKnowledgeRating * 10) / 10,
        averagePunctualityRating: Math.round(averagePunctualityRating * 10) / 10
      }
    });

  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if user can review another user (based on completed meetings)
export const canReviewUser = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { userId } = req.params;

    // Find completed meetings between these users
    const completedMeetings = await Meeting.findAll({
      where: {
        [Op.or]: [
          {
            organizer_id: reviewerId,
            participant_id: userId,
            status: 'completed'
          },
          {
            organizer_id: userId,
            participant_id: reviewerId,
            status: 'completed'
          }
        ]
      }
    });

    // Check which meetings don't have reviews yet
    const meetingsWithoutReviews = [];
    for (const meeting of completedMeetings) {
      const existingReview = await Review.findOne({
        where: {
          reviewer_id: reviewerId,
          reviewee_id: userId,
          meeting_id: meeting.id
        }
      });

      if (!existingReview) {
        meetingsWithoutReviews.push(meeting);
      }
    }

    res.json({
      success: true,
      data: {
        canReview: meetingsWithoutReviews.length > 0,
        availableMeetings: meetingsWithoutReviews,
        totalCompletedMeetings: completedMeetings.length
      }
    });

  } catch (error) {
    console.error('Can review user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  createReview,
  getUserReviews,
  getUserRating,
  getReviewsByUser,
  updateReview,
  deleteReview,
  canReviewUser
};