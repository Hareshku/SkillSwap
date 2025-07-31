import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  giver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'meetings',
      key: 'id'
    }
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  feedback_type: {
    type: DataTypes.ENUM('skill_teaching', 'skill_learning', 'communication', 'overall'),
    allowNull: false
  },
  skills_rated: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of skills with individual ratings'
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'feedback',
  indexes: [
    {
      fields: ['giver_id']
    },
    {
      fields: ['receiver_id']
    },
    {
      fields: ['meeting_id']
    },
    {
      fields: ['rating']
    },
    {
      unique: true,
      fields: ['giver_id', 'receiver_id', 'meeting_id']
    }
  ]
});

export default Feedback;
