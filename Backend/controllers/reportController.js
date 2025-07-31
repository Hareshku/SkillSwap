import { Report, User, Post, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// Create a report
export const createReport = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const {
      reportedUserId,
      reportedPostId,
      reportType,
      reason,
      description,
      evidence
    } = req.body;

    // Validate that either user or post is being reported
    if (!reportedUserId && !reportedPostId) {
      return res.status(400).json({
        success: false,
        message: 'Either reported user or reported post must be specified'
      });
    }

    // Check if reported user exists (if reporting a user)
    if (reportedUserId) {
      const reportedUser = await User.findByPk(reportedUserId);
      if (!reportedUser) {
        return res.status(404).json({
          success: false,
          message: 'Reported user not found'
        });
      }
    }

    // Check if reported post exists (if reporting a post)
    if (reportedPostId) {
      const reportedPost = await Post.findByPk(reportedPostId);
      if (!reportedPost) {
        return res.status(404).json({
          success: false,
          message: 'Reported post not found'
        });
      }
    }

    // Check if user has already reported this user/post
    const existingReport = await Report.findOne({
      where: {
        reporter_id: reporterId,
        ...(reportedUserId && { reported_user_id: reportedUserId }),
        ...(reportedPostId && { reported_post_id: reportedPostId }),
        status: { [Op.in]: ['pending', 'under_review'] }
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this user/post'
      });
    }

    // Create report
    const report = await Report.create({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reported_post_id: reportedPostId,
      report_type: reportType,
      reason,
      description,
      evidence: Array.isArray(evidence) ? evidence : [evidence],
      status: 'pending'
    });

    // Fetch report with related data
    const reportWithData = await Report.findByPk(report.id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Post,
          as: 'reportedPost',
          attributes: ['id', 'title', 'description']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: reportWithData
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
};

// Get user's reports
export const getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reports = await Report.findAndCountAll({
      where: { reporter_id: userId },
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Post,
          as: 'reportedPost',
          attributes: ['id', 'title', 'description']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        reports: reports.rows,
        pagination: {
          total: reports.count,
          page,
          pages: Math.ceil(reports.count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

// Get single report
export const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: {
        id: reportId,
        reporter_id: userId
      },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Post,
          as: 'reportedPost',
          attributes: ['id', 'title', 'description']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
};

// Update report (for adding additional information)
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;
    const { description, evidence } = req.body;

    const report = await Report.findOne({
      where: {
        id: reportId,
        reporter_id: userId,
        status: { [Op.in]: ['pending', 'under_review'] }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or cannot be updated'
      });
    }

    await report.update({
      description,
      evidence: Array.isArray(evidence) ? evidence : [evidence],
      updated_at: new Date()
    });

    // Fetch updated report with related data
    const updatedReport = await Report.findByPk(reportId, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Post,
          as: 'reportedPost',
          attributes: ['id', 'title', 'description']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report'
    });
  }
};

// Cancel report
export const cancelReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: {
        id: reportId,
        reporter_id: userId,
        status: { [Op.in]: ['pending', 'under_review'] }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or cannot be cancelled'
      });
    }

    await report.update({
      status: 'cancelled',
      resolved_at: new Date()
    });

    res.json({
      success: true,
      message: 'Report cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel report'
    });
  }
};

// Get report statistics for user
export const getReportStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Report.findAll({
      where: { reporter_id: userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const formattedStats = {
      pending: 0,
      under_review: 0,
      resolved: 0,
      rejected: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status] = parseInt(stat.count);
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics'
    });
  }
};
