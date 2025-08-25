import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000]
    }
  },
  skills_to_teach: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isArray(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Skills to teach must be a non-empty array');
        }
      }
    }
  },
  skills_to_learn: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isArray(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Skills to learn must be a non-empty array');
        }
      }
    }
  },
  experience_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: false
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON object containing available days and time slots'
  },
  preferred_meeting_type: {
    type: DataTypes.ENUM('online', 'offline', 'both'),
    defaultValue: 'online'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Required if preferred_meeting_type includes offline'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'archived', 'removed'),
    defaultValue: 'active'
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approval_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  removed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  removed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  removed_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of tags for better searchability'
  }
}, {
  tableName: 'posts',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_approved']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Post;
