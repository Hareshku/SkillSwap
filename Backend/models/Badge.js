import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 500]
    }
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  badge_type: {
    type: DataTypes.ENUM(
      'skill_sharing',
      'community_engagement',
      'learning_achievement',
      'mentorship',
      'consistency',
      'special'
    ),
    allowNull: false
  },
  criteria: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON object defining the criteria to earn this badge'
  },
  points_value: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 1,
      max: 1000
    }
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  color_code: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  }
}, {
  tableName: 'badges'
});

// User Badge junction table
const UserBadge = sequelize.define('UserBadge', {
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
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'badges',
      key: 'id'
    }
  },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  progress_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON object tracking progress towards earning the badge'
  },
  is_displayed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether user wants to display this badge on their profile'
  }
}, {
  tableName: 'user_badges',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'badge_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['badge_id']
    }
  ]
});

export { Badge, UserBadge };
export default Badge;
