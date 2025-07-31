import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RecommendationTracking = sequelize.define('RecommendationTracking', {
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
  recommended_post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  recommendation_type: {
    type: DataTypes.ENUM('personalized', 'skill_based', 'trending'),
    allowNull: false,
    defaultValue: 'personalized'
  },
  action: {
    type: DataTypes.ENUM('view', 'click', 'contact', 'like', 'connection_request'),
    allowNull: false
  },
  match_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'The recommendation score when the action was taken'
  },
  skill_matches: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of skill matches that led to this recommendation'
  },
  session_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Session identifier for tracking user behavior'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  filters_applied: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Filters that were active when recommendation was shown'
  },
  position_in_list: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Position of the recommendation in the list (1-based)'
  },
  time_spent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time spent viewing the recommendation in seconds'
  },
  successful_connection: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this recommendation led to a successful connection'
  },
  feedback_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'User feedback rating for the recommendation quality (1-5)'
  },
  feedback_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'recommendation_tracking',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['recommended_post_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['recommendation_type']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['successful_connection']
    },
    {
      fields: ['match_score']
    }
  ]
});

export default RecommendationTracking;
