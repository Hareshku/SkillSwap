import { User, Post, Report, Message, Meeting, Badge, Skill } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      activePosts,
      totalReports,
      pendingReports,
      totalMeetings,
      totalMessages
    ] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      Post.count(),
      Post.count({ where: { status: 'active' } }),
      Report.count(),
      Report.count({ where: { status: 'pending' } }),
      Meeting.count(),
      Message.count()
    ]);

    // Get user registration stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        recent: recentUsers
      },
      posts: {
        total: totalPosts,
        active: activePosts
      },
      reports: {
        total: totalReports,
        pending: pendingReports
      },
      meetings: {
        total: totalMeetings
      },
      messages: {
        total: totalMessages
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { search, status, role } = req.query;

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.is_active = status === 'active';
    }

    if (role) {
      whereClause.role = role;
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'title', 'status']
        },
        {
          model: Report,
          as: 'reportsReceived',
          attributes: ['id', 'status']
        }
      ],
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
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Block/Unblock user
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'block' or 'unblock'

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isActive = action === 'unblock';
    await user.update({
      is_active: isActive,
      blocked_reason: action === 'block' ? reason : null,
      blocked_at: action === 'block' ? new Date() : null
    });

    res.json({
      success: true,
      message: `User ${action}ed successfully`,
      data: { userId, isActive }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get all reports with pagination and filters
export const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, reportType } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (reportType) {
      whereClause.report_type = reportType;
    }

    const reports = await Report.findAndCountAll({
      where: whereClause,
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
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

// Handle report (approve/reject)
export const handleReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, adminNotes } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.id;

    const report = await Report.findByPk(reportId, {
      include: [
        {
          model: User,
          as: 'reportedUser'
        },
        {
          model: Post,
          as: 'reportedPost'
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    let status = action === 'approve' ? 'resolved' : 'rejected';

    await report.update({
      status,
      admin_notes: adminNotes,
      reviewed_by: adminId,
      resolved_at: new Date()
    });

    // If report is approved, take action on reported content
    if (action === 'approve') {
      if (report.reportedUser) {
        // Block the reported user
        await report.reportedUser.update({
          is_active: false,
          blocked_reason: `Reported for: ${report.reason}`,
          blocked_at: new Date()
        });
      }

      if (report.reportedPost) {
        // Remove the reported post
        await report.reportedPost.update({
          status: 'removed',
          removed_reason: `Reported for: ${report.reason}`,
          removed_at: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Report ${action}d successfully`,
      data: report
    });
  } catch (error) {
    console.error('Handle report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle report'
    });
  }
};

// Get all posts with pagination and filters
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const posts = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'email']
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
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

// Moderate post (approve/remove)
export const moderatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'remove'

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const adminId = req.user.id;

    if (action === 'remove') {
      // For removal, we keep the status but mark it as removed
      await post.update({
        removed_reason: reason,
        removed_at: new Date(),
        removed_by: adminId
      });
    } else if (action === 'approve') {
      // For approval, ensure it's active and clear any removal data
      await post.update({
        status: 'active',
        is_approved: true,
        approved_by: adminId,
        approved_at: new Date(),
        removed_reason: null,
        removed_at: null,
        removed_by: null
      });
    }

    res.json({
      success: true,
      message: `Post ${action}d successfully`,
      data: {
        postId,
        action,
        removed: action === 'remove'
      }
    });
  } catch (error) {
    console.error('Moderate post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate post'
    });
  }
};

// Create admin user
export const createAdmin = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      email_verified: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin'
    });
  }
};

// ==================== ENHANCED ADMIN OPERATIONS ====================

// Approve user (for user verification/approval system)
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      is_verified: true,
      verified_by: adminId,
      verified_at: new Date(),
      verification_notes: notes || null
    });

    res.json({
      success: true,
      message: 'User approved successfully',
      data: {
        userId: user.id,
        email: user.email,
        full_name: user.full_name,
        verified_at: user.verified_at
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user'
    });
  }
};

// Reject user approval
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      is_verified: false,
      is_active: false,
      rejection_reason: reason,
      rejected_by: adminId,
      rejected_at: new Date()
    });

    res.json({
      success: true,
      message: 'User rejected successfully',
      data: {
        userId: user.id,
        email: user.email,
        rejection_reason: reason
      }
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user'
    });
  }
};

// Approve post
export const approvePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.update({
      is_approved: true,
      approved_by: adminId,
      approved_at: new Date(),
      approval_notes: notes || null,
      status: 'active'
    });

    res.json({
      success: true,
      message: 'Post approved successfully',
      data: {
        postId: post.id,
        title: post.title,
        author: post.author,
        approved_at: post.approved_at
      }
    });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve post'
    });
  }
};

// Bulk approve posts
export const bulkApprovePosts = async (req, res) => {
  try {
    const { postIds, notes } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post IDs array is required'
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const posts = await Post.findAll({
        where: { id: { [Op.in]: postIds } },
        transaction
      });

      if (posts.length !== postIds.length) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Some posts not found'
        });
      }

      await Post.update({
        is_approved: true,
        approved_by: adminId,
        approved_at: new Date(),
        approval_notes: notes || null,
        status: 'active'
      }, {
        where: { id: { [Op.in]: postIds } },
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: `${postIds.length} posts approved successfully`,
        data: { approvedCount: postIds.length }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Bulk approve posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk approve posts'
    });
  }
};

// Bulk block users
export const bulkBlockUsers = async (req, res) => {
  try {
    const { userIds, reason } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for blocking users'
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const users = await User.findAll({
        where: {
          id: { [Op.in]: userIds },
          role: 'user' // Prevent blocking admin users
        },
        transaction
      });

      if (users.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'No valid users found to block'
        });
      }

      await User.update({
        is_active: false,
        blocked_reason: reason,
        blocked_by: adminId,
        blocked_at: new Date()
      }, {
        where: {
          id: { [Op.in]: users.map(u => u.id) },
          role: 'user'
        },
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: `${users.length} users blocked successfully`,
        data: { blockedCount: users.length }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Bulk block users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk block users'
    });
  }
};

// Enhanced report handling with detailed actions
export const handleReportDetailed = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, adminNotes, actionTaken, actionDetails, priority } = req.body;
    const adminId = req.user.id;

    const report = await Report.findByPk(reportId, {
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

    const transaction = await sequelize.transaction();

    try {
      // Update report status
      await report.update({
        status: action === 'approve' ? 'resolved' : 'dismissed',
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: new Date(),
        action_taken: actionTaken || 'no_action',
        action_details: actionDetails,
        priority: priority || report.priority
      }, { transaction });

      // Take action based on admin decision
      if (action === 'approve' && actionTaken) {
        switch (actionTaken) {
          case 'user_suspended':
            if (report.reportedUser) {
              await report.reportedUser.update({
                is_active: false,
                blocked_reason: `Suspended due to report: ${report.reason}`,
                blocked_by: adminId,
                blocked_at: new Date()
              }, { transaction });
            }
            break;

          case 'content_removed':
            if (report.reportedPost) {
              await report.reportedPost.update({
                status: 'removed',
                removed_reason: `Removed due to report: ${report.reason}`,
                removed_by: adminId,
                removed_at: new Date()
              }, { transaction });
            }
            break;

          case 'warning_sent':
            // In a real app, you'd send a warning email/notification here
            console.log(`Warning sent to user ${report.reported_user_id} for report ${reportId}`);
            break;
        }
      }

      await transaction.commit();

      res.json({
        success: true,
        message: `Report ${action}d successfully`,
        data: {
          reportId: report.id,
          status: report.status,
          actionTaken: report.action_taken,
          reviewedAt: report.reviewed_at
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Handle report detailed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle report'
    });
  }
};

// Change user role (promote/demote)
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, reason } = req.body;
    const adminId = req.user.id;

    if (!['user', 'admin'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === newRole) {
      return res.status(400).json({
        success: false,
        message: `User already has ${newRole} role`
      });
    }

    const oldRole = user.role;
    await user.update({
      role: newRole,
      role_changed_by: adminId,
      role_changed_at: new Date(),
      role_change_reason: reason || null
    });

    res.json({
      success: true,
      message: `User role changed from ${oldRole} to ${newRole}`,
      data: {
        userId: user.id,
        email: user.email,
        oldRole,
        newRole,
        changedAt: user.role_changed_at
      }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user role'
    });
  }
};

// Get pending approvals (users and posts)
export const getPendingApprovals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { type } = req.query; // 'users', 'posts', or 'all'

    let pendingUsers = [];
    let pendingPosts = [];

    if (type === 'users' || type === 'all' || !type) {
      const users = await User.findAndCountAll({
        where: {
          is_verified: false,
          is_active: true,
          role: 'user'
        },
        attributes: { exclude: ['password'] },
        limit: type === 'users' ? limit : Math.floor(limit / 2),
        offset: type === 'users' ? offset : 0,
        order: [['created_at', 'ASC']]
      });
      pendingUsers = users;
    }

    if (type === 'posts' || type === 'all' || !type) {
      const posts = await Post.findAndCountAll({
        where: {
          is_approved: false,
          status: { [Op.ne]: 'removed' }
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'full_name', 'email']
          }
        ],
        limit: type === 'posts' ? limit : Math.floor(limit / 2),
        offset: type === 'posts' ? offset : 0,
        order: [['created_at', 'ASC']]
      });
      pendingPosts = posts;
    }

    res.json({
      success: true,
      data: {
        pendingUsers: pendingUsers.rows || [],
        pendingPosts: pendingPosts.rows || [],
        pagination: {
          users: pendingUsers.count ? {
            total: pendingUsers.count,
            page,
            pages: Math.ceil(pendingUsers.count / limit)
          } : null,
          posts: pendingPosts.count ? {
            total: pendingPosts.count,
            page,
            pages: Math.ceil(pendingPosts.count / limit)
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals'
    });
  }
};

// Get admin activity summary
export const getAdminActivity = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      recentlyApprovedUsers,
      recentlyBlockedUsers,
      recentlyApprovedPosts,
      recentlyRemovedPosts,
      recentlyHandledReports
    ] = await Promise.all([
      User.count({
        where: {
          is_verified: true,
          verified_at: { [Op.gte]: startDate }
        }
      }),
      User.count({
        where: {
          is_active: false,
          blocked_at: { [Op.gte]: startDate }
        }
      }),
      Post.count({
        where: {
          is_approved: true,
          approved_at: { [Op.gte]: startDate }
        }
      }),
      Post.count({
        where: {
          status: 'removed',
          removed_at: { [Op.gte]: startDate }
        }
      }),
      Report.count({
        where: {
          status: { [Op.in]: ['resolved', 'dismissed'] },
          reviewed_at: { [Op.gte]: startDate }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        activity: {
          usersApproved: recentlyApprovedUsers,
          usersBlocked: recentlyBlockedUsers,
          postsApproved: recentlyApprovedPosts,
          postsRemoved: recentlyRemovedPosts,
          reportsHandled: recentlyHandledReports
        }
      }
    });
  } catch (error) {
    console.error('Get admin activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin activity'
    });
  }
};



