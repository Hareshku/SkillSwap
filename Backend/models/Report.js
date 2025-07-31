import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reported_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reported_post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  report_type: {
    type: DataTypes.ENUM(
      'inappropriate_behavior',
      'spam',
      'harassment',
      'fake_profile',
      'inappropriate_content',
      'scam',
      'other'
    ),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  evidence_urls: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of URLs to screenshots or other evidence'
  },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'resolved', 'dismissed'),
    defaultValue: 'pending'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  action_taken: {
    type: DataTypes.ENUM(
      'no_action',
      'warning_sent',
      'content_removed',
      'user_suspended',
      'user_banned',
      'other'
    ),
    allowNull: true
  },
  action_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  }
}, {
  tableName: 'reports',
  indexes: [
    {
      fields: ['reporter_id']
    },
    {
      fields: ['reported_user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Report;
